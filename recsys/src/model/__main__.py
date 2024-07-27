import asyncio
import datetime
import time
from contextlib import suppress
from difflib import SequenceMatcher

import loguru
import numpy as np
import pandas as pd
import pytz
from geopy.distance import distance
from loguru import logger
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler

from model.preprocesor import Preprocessor
from settings import prisma


class ContentBasedRecommendation:
    def __init__(
        self, max_distance_km=50, max_days=30, threshold=0.6, _logger=loguru.logger
    ):
        self.max_distance_km = max_distance_km
        self.max_days = max_days
        self.threshold = threshold
        self.logger = _logger

    @staticmethod
    def create_feature_vector(entity: pd.Series, entity_type: str):
        if entity_type == "roommate":
            preferences_property = list(
                entity.get("roommate.preferences.property").values()
            )
        else:  # entity_type == "property"
            preferences_property = [
                entity.get(f"property.share_with"),
                entity.get(f"property.property_type"),
                entity.get(f"property.stay_duration"),
            ]
        feature_vector = [
            # entity.get("university.graduation_year"),
            # entity.get("university.speciality_code_major"),
            entity.get(f"{entity_type}.rooms_number"),
            entity.get(f"{entity_type}.tenants_age"),
            entity.get(f"{entity_type}.tenants_number"),
            *preferences_property,
            *list(entity[f"{entity_type}.preferences.roommate"].values()),
        ]
        return feature_vector

    @staticmethod
    def price_similarity(roommate: pd.Series, property: pd.Series):
        rm_price = roommate["roommate.budget_month"]
        pr_price = property["property.rent_price_month"] / (
            property["property.tenants_number"] + 1
        )
        price_diff = abs(rm_price - pr_price)
        return 1 - (price_diff / max(rm_price, pr_price))

    def date_similarity(self, roommate: pd.Series, property: pd.Series):
        utc = pytz.UTC
        move_in_date = datetime.datetime.fromisoformat(
            roommate["roommate.move_in_date"].__str__()
        ).replace(tzinfo=utc)
        available_from = datetime.datetime.fromisoformat(
            property["property.available_from"].__str__()
        ).replace(tzinfo=utc)
        date_diff = abs((move_in_date - available_from).days)
        return max(0, 1 - (date_diff / self.max_days))

    def geo_similarity(self, roommate: pd.Series, property: pd.Series):
        from_coords = (roommate["roommate.geo_lat"], roommate["roommate.geo_lon"])
        to_coords = (property["property.geo_lat"], property["property.geo_lon"])
        dist = distance(from_coords, to_coords).km
        return max(0, 1 - (dist / self.max_distance_km))

    def geo_similarity_university(self, roommate: pd.Series, property: pd.Series):
        from_coords = (roommate["university.geo_lat"], roommate["university.geo_lon"])
        to_coords = (property["university.geo_lat"], property["university.geo_lon"])
        dist = distance(from_coords, to_coords).km
        return max(0, 1 - (dist / self.max_distance_km))

    @staticmethod
    def interests_similarity(roommate: pd.Series, property: pd.Series):
        sm = SequenceMatcher(
            None, roommate["profile.interest_areas"], property["profile.interest_areas"]
        )
        return round(sm.ratio(), 2)

    async def generate_recommendations(self, df: pd.DataFrame):
        if self.threshold and self.threshold <= 0:
            raise ValueError(f"threshold={self.threshold}")

        roommate_df = pd.json_normalize(
            df[df["roommate"].notna()].to_dict(orient="records"), max_level=2
        ).dropna(axis=1, how="all")
        roommate_description_df = roommate_df.pop("roommate.description")

        property_df = pd.json_normalize(
            df[df["property"].notna()].to_dict(orient="records"), max_level=2
        ).dropna(axis=1, how="all")
        property_description_df = property_df.pop("property.description")

        common_num_cols = ["rooms_number", "tenants_age", "tenants_number"]
        for col in common_num_cols:
            roommate_df[f"roommate.{col}"] = roommate_df[f"roommate.{col}"].fillna(
                float(roommate_df[f"roommate.{col}"].mean())
            )
            property_df[f"property.{col}"] = property_df[f"property.{col}"].fillna(
                float(property_df[f"property.{col}"].mean())
            )

        roommate_matrix = roommate_df.apply(
            lambda x: self.create_feature_vector(x, "roommate"), axis=1
        )
        property_matrix = property_df.apply(
            lambda x: self.create_feature_vector(x, "property"), axis=1
        )

        sc = StandardScaler()
        sc.fit([*roommate_matrix.to_list(), *property_matrix.to_list()])
        roommate_matrix_scaled = sc.transform(roommate_matrix.to_list())
        property_matrix_scaled = sc.transform(property_matrix.to_list())

        shape = (len(roommate_df), len(property_df))
        geo_similarity_matrix = np.zeros(shape)
        geo_similarity_university_matrix = np.zeros(shape)
        profile_interests_matrix = np.zeros(shape)

        for i, rm in roommate_df.iterrows():
            for j, pr in property_df.iterrows():
                with suppress(Exception):
                    geo_similarity_matrix[i][j] = self.geo_similarity(rm, pr)
                    geo_similarity_university_matrix[i][j] = (
                        self.geo_similarity_university(rm, pr)
                    )
                    profile_interests_matrix[i][j] = self.interests_similarity(rm, pr)

        main_similarity_matrix = (
                                     1 - cosine_similarity(roommate_matrix_scaled, property_matrix_scaled)
                                 ) / 2

        similarity_matrix = (
                                main_similarity_matrix
                                + geo_similarity_university_matrix
                                + geo_similarity_university_matrix
                                + profile_interests_matrix
                            ) / 4

        result = await self.store_recommendations(
            similarity_matrix, roommate_df, property_df
        )
        return result

    async def store_recommendations(self, similarity_matrix, roommate_df, property_df):
        created_count, updated_count, deleted_count = 0, 0, 0
        for i, row in enumerate(similarity_matrix.tolist()):
            recommendations = []
            for j, score in enumerate(row):
                score = round(score, 2)
                if self.threshold and score < self.threshold:
                    continue

                rm = roommate_df.iloc[i]
                pr = property_df.iloc[j]
                if rm["id"] == pr["id"]:
                    continue

                if rm["roommate.budget_month"] < (
                    pr["property.rent_price_month"]
                    // (pr["property.tenants_number"] + 1)
                ):
                    self.logger.debug("skip by price")
                    continue

                utc = pytz.UTC
                move_in_date = datetime.datetime.fromisoformat(
                    rm["roommate.move_in_date"].__str__()
                ).replace(tzinfo=utc)
                available_from = datetime.datetime.fromisoformat(
                    pr["property.available_from"].__str__()
                ).replace(tzinfo=utc)

                if move_in_date < available_from:
                    self.logger.debug("skip date")
                    continue

                roommate_id = int(rm["roommate.id"])
                property_id = int(pr["property.id"])
                where = {
                    "property_id_roommate_id": {
                        "property_id": property_id,
                        "roommate_id": roommate_id,
                    }
                }

                recommendations_in_db = await prisma.recommendations.find_unique(
                    where=where
                )
                if recommendations_in_db and score > recommendations_in_db.score:
                    recommendations_update_input = {"score": score}
                    await prisma.recommendations.update(
                        data=recommendations_update_input, where=where
                    )
                    updated_count += 1
                    self.logger.info(
                        {
                            "update": {
                                **where["property_id_roommate_id"],
                                **recommendations_update_input,
                                "old": recommendations_in_db.score,
                            }
                        }
                    )
                else:
                    recommendations_create_input = {
                        "roommate_id": roommate_id,
                        "property_id": property_id,
                        "score": score,
                    }
                    self.logger.info({"create": recommendations_create_input})
                    recommendations.append(recommendations_create_input)

            recommendations = sorted(recommendations, key=lambda x: x["score"])
            created_count += await prisma.recommendations.create_many(
                data=recommendations, skip_duplicates=True
            )
        res = {
            "threshold": self.threshold,
            "created_count": created_count,
            "updated_count": updated_count,
            "deleted_count": deleted_count,
        }
        self.logger.info(res)
        return res


async def generate_recommendations(take: int | None = None):
    cb = ContentBasedRecommendation()
    dataset = await Preprocessor(prisma).dataset()
    df = pd.DataFrame(dataset)
    await cb.generate_recommendations(df)


async def performance_test(take: int):
    start_time = time.time()
    await generate_recommendations(take=take)
    elapsed_time = time.time() - start_time
    return elapsed_time


async def start_performance_test():
    res = []
    await prisma.connect()
    for n in range(100, 500, 100):
        logger.debug(n)
        await prisma.query_raw("truncate table recommendations cascade;")
        elapsed_time = asyncio.run(performance_test(n))
        res.append(f"Time for {n} profiles: {elapsed_time:.2f} seconds")
    logger.debug("\n".join(res))


if __name__ == "__main__":
    asyncio.run(generate_recommendations())
