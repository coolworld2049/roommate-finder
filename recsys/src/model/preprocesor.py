import asyncio
import json
import pathlib
import time
import typing
from contextlib import suppress
from datetime import datetime, date

import nest_asyncio
import numpy as np
import pydantic
from prisma import models, enums, Prisma
from sklearn.preprocessing import LabelEncoder

from settings import prisma

nest_asyncio.apply()


class PropertySummarySchema(pydantic.BaseModel):
    rooms_number: int | None
    tenants_number: int | None
    tenants_age: int | None
    rent_per_tenant: int | None
    available_from_min: date | None
    available_from_max: date | None
    gender_male_count: int | None
    gender_female_count: int | None


class DatasetSchema(pydantic.BaseModel):
    id: str
    profile: dict | None = None
    university: dict | None = None
    property: dict | None = None
    roommate: dict | None = None


class DatasetProcessor:
    def __init__(
        self,
        profile: models.profiles,
        db_enums: dict[str, typing.Any],
        db_preferences: models.preferences,
    ):
        self.profile = profile
        self.db_enums: dict[str, typing.Any] = db_enums
        self.db_preferences: models.preferences = db_preferences
        self.dataset: DatasetSchema = DatasetSchema(id=profile.id)

    def build(self):
        self.process_profile()
        if self.profile.profile_universities:
            self.process_profile_university()

        if (
            self.profile.roommates
            and self.profile.roommates.status == enums.ad_status.active
        ):
            self.process_roommate()
            del self.dataset.property
        elif (
            self.profile.properties
            and self.profile.properties.status == enums.ad_status.active
        ):
            self.process_property()
            del self.dataset.roommate

        return self.dataset.model_dump()

    @staticmethod
    def dob_to_age(dob: datetime):
        today = datetime.now()
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

    @staticmethod
    def convert_values(arr: list):
        return [x.replace("-", "").replace(" ", "_") for x in arr]

    def _encode_enum(self, data: dict):
        for k, v in data.items():
            if k in self.db_enums.keys():
                le = LabelEncoder()
                le.fit(self.convert_values(self.db_enums[k]))
                value = np.array(le.transform(self.convert_values([v]))).tolist()
                data[k] = value[0]
        return data

    def __encode_model_preferences(
        self,
        in_preferences: (
            list[models.property_in_preferences] | list[models.roommate_in_preferences]
        ),
    ):
        preferences = {}
        for p in in_preferences:
            preference = list(
                filter(lambda c: c.id == p.preference_id, self.db_preferences)
            )[0]
            preferences.setdefault(preference.category, {})
            label_encoder = LabelEncoder()
            label_encoder.fit(["", *preference.options])
            preferences[preference.category][
                self.convert_values([preference.name])[0]
            ] = int(np.array(label_encoder.transform([p.value]))[0])
        return preferences

    def process_profile(self):
        gender_le = LabelEncoder().fit([x for x in enums.gender])
        self.dataset.profile = dict(
            age=self.dob_to_age(self.profile.dob),
            gender=int(np.array(gender_le.transform([self.profile.gender]))[0]),
            interest_areas=self.profile.interest_areas,
        )

    def process_profile_university(self):
        speciality_code = (
            self.profile.profile_universities.higher_education_specialties.code
        )
        speciality_code_arr = [int(x) for x in speciality_code.split(".")]
        self.dataset.university = dict(
            **self.profile.profile_universities.model_dump(
                include={"university_name", "graduation_year", "geo_lat", "geo_lon"}
            ),
            speciality_code_major=(
                speciality_code_arr[0] if len(speciality_code_arr) > 0 else None
            ),
            speciality_code_minor=(
                speciality_code_arr[1] if len(speciality_code_arr) > 0 else None
            ),
        )
        with suppress(Exception):
            self.dataset.university["geo_lat"] = (
                self.profile.profile_universities.geo_lat.__float__()
            )
            self.dataset.university["geo_lon"] = (
                self.profile.profile_universities.geo_lon.__float__()
            )

    async def _get_property_summary(self):
        property_summary = await prisma.query_raw(
            """
            select 
                rooms_number,tenants_number,
                tenants_age_avg as tenants_age,rent_per_tenant,
                available_from_min,available_from_max,
                gender_male_count,gender_female_count
            from property_room_tenant_summary 
            where profile_id = $1::uuid
            """,
            self.profile.id,
        )
        if len(property_summary) < 1:
            return {}
        property_summary_model = PropertySummarySchema(**property_summary[0])
        return property_summary_model

    @staticmethod
    def _determine_property_share_with(
        summary: PropertySummarySchema,
    ) -> enums.share_with:
        if summary.gender_male_count > summary.gender_female_count:
            return enums.gender.male
        elif summary.gender_male_count < summary.gender_female_count:
            return enums.gender.female
        return enums.share_with.anyone

    def process_roommate(self):
        self.dataset.roommate = {
            **self.profile.roommates.model_dump(
                include={
                    "id",
                    "description",
                    "budget_month",
                    "rooms_number",
                    "tenants_number",
                    "tenants_age",
                    "move_in_date",
                    "geo_lat",
                    "geo_lon",
                }
            ),
            "move_in_date": (
                self.profile.roommates.move_in_date or self.profile.roommates.created_at
            ),
            "preferences": self.__encode_model_preferences(
                self.profile.roommates.roommate_in_preferences
            ),
        }
        with suppress(Exception):
            self.dataset.roommate["geo_lat"] = (
                self.profile.roommates.geo_lat.__float__()
            )
            self.dataset.roommate["geo_lon"] = (
                self.profile.roommates.geo_lon.__float__()
            )

        for arr_col in ["rooms_number", "tenants_number", "tenants_age"]:
            v = self.dataset.roommate[arr_col]
            if len(v) < 1:
                self.dataset.roommate[arr_col] = None
                continue
            self.dataset.roommate[arr_col] = np.mean(v)

        self._encode_enum(self.dataset.roommate)

    def process_property(self):
        property_summary = asyncio.run(self._get_property_summary())
        self.dataset.property = {
            **self.profile.properties.model_dump(
                include={
                    "id",
                    "description",
                    "rent_price_month",
                    "rooms_number",
                    "tenants_number",
                    "tenants_age",
                    "stay_duration",
                    "property_type",
                    "geo_lat",
                    "geo_lon",
                }
            ),
            **property_summary.model_dump(
                include={
                    "rooms_number",
                    "tenants_number",
                    "tenants_age",
                    "rent_per_tenant",
                }
            ),
            "share_with": self._determine_property_share_with(property_summary),
            "available_from": (
                property_summary.available_from_min
                or self.profile.properties.created_at
            ),
            "preferences": self.__encode_model_preferences(
                self.profile.properties.property_in_preferences
            ),
        }
        with suppress(Exception):
            self.dataset.property["geo_lat"] = (
                self.profile.properties.geo_lat.__float__()
            )
            self.dataset.property["geo_lon"] = (
                self.profile.properties.geo_lon.__float__()
            )
            self.dataset.property["metro.geo_lat"] = (
                self.profile.properties.nearest_metro_station["geo_lat"].__float__()
            )
            self.dataset.property["metro.geo_lon"] = (
                self.profile.properties.nearest_metro_station["geo_lon"].__float__()
            )
        self._encode_enum(self.dataset.property)


class Preprocessor:
    def __init__(self, prisma: Prisma):
        self.prisma = prisma
        if not prisma.is_connected():
            asyncio.run(prisma.connect())

    async def execute_sql_query(self, sql_file_name: typing.Literal["enums"], *args):
        query = pathlib.Path(__file__).parent.parent.joinpath(
            f"queries/{sql_file_name}.sql"
        )
        resp = await self.prisma.query_raw(query=query.read_text(), *args)
        return resp

    async def dataset(
        self,
        take: int | None = None,
        skip: int | None = None,
    ):
        datasets = []
        profiles = await self.prisma.profiles.find_many(
            include={
                "profile_universities": {
                    "include": {"higher_education_specialties": True}
                },
                "properties": {"include": {"property_in_preferences": True}},
                "roommates": {"include": {"roommate_in_preferences": True}},
            },
            take=take,
            skip=skip,
        )
        db_enums_in_db = await self.execute_sql_query(sql_file_name="enums")
        db_enums = {
            x["enum_name"]: [v.lstrip().rstrip() for v in x["enum_values"].split(",")]
            for x in db_enums_in_db
        }
        db_preferences = await self.prisma.preferences.find_many()
        for p in profiles:
            result = DatasetProcessor(
                profile=p, db_enums=db_enums, db_preferences=db_preferences
            ).build()
            datasets.append(result)
        return datasets


async def main():
    pp = Preprocessor(prisma)
    dataset = await pp.dataset()
    path = pathlib.Path(__file__).parent.joinpath("dataset")
    path.mkdir(exist_ok=True)
    path.joinpath("example.json").write_bytes(
        json.dumps(
            [dataset[0], dataset[-1]], ensure_ascii=False, indent=2, default=str
        ).encode()
    )
    path.joinpath("roommate.json").write_bytes(
        json.dumps(dataset[0], ensure_ascii=False, indent=2, default=str).encode()
    )
    path.joinpath("property.json").write_bytes(
        json.dumps(dataset[-1], ensure_ascii=False, indent=2, default=str).encode()
    )


async def performance_test(take: int):
    start_time = time.time()

    pp = Preprocessor(prisma)
    dataset = await pp.dataset(take=take)

    elapsed_time = time.time() - start_time
    return elapsed_time


async def start_performance_test():
    for n in range(100, 600, 100):
        elapsed_time = asyncio.run(performance_test(take=n))
        print(f"Time for {n} profiles: {elapsed_time:.2f} seconds")


if __name__ == "__main__":
    asyncio.run(start_performance_test())
