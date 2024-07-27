import asyncio
import json
import pathlib
import random
from collections import defaultdict, deque
from contextlib import suppress
from copy import deepcopy
from decimal import Decimal

import gender_guesser.detector as gd
import gotrue
import gotrue.errors
from loguru import logger
from mimesis import Person, Address, Datetime, Finance, Internet, Text, Locale, Gender
from prisma import Json, enums, types, models
from supabase import Client

from fake_data.data.text import (
    roommate_descriptions,
    roommate_titles,
    property_titles,
    property_descriptions,
    room_titles,
    room_descriptions,
)
from settings import supabase, settings, prisma

locale = Locale.RU
person = Person(locale=Locale.EN)
address = Address(locale=locale)
datetime = Datetime(locale=locale)
finance = Finance(locale=locale)
internet = Internet()
text = Text()
gender_detector = gd.Detector(case_sensitive=False)

profile_bio_dataset: list[dict] = json.loads(
    pathlib.Path(__file__).parent.joinpath("data/profile_bio.json").read_bytes()
)
metro_station_dataset: list[dict] = json.loads(
    pathlib.Path(__file__).parent.joinpath("data/metro.json").read_bytes()
)
university_dataset: list[dict] = json.loads(
    pathlib.Path(__file__).parent.joinpath("data/university.json").read_bytes()
)
city_dataset: list[dict] = json.loads(
    pathlib.Path(__file__).parent.joinpath("data/city.json").read_bytes()
)
address_dataset: list[dict] = []

for item in city_dataset:
    for i in range(0, 100):
        street = address.street_name()
        street_suffix = address.street_suffix()
        street_number = address.street_number()
        addr = {
            "address": f"{item['name']}, {street_suffix} {street}, {street_number}",
            "geo_lat": random.uniform(*item["geo_lat"].values()),
            "geo_lon": random.uniform(*item["geo_lon"].values()),
            "city": item["name"],
            "city_with_type": f"г. {item['name']}",
            "street": street,
            "street_with_type": f"{street_suffix} {street}",
        }
        address_dataset.append(addr)


def get_random_metro_station(city: str):
    def rgb2hex(r, g, b):
        return "{:02x}{:02x}{:02x}".format(r, g, b).upper()

    metro_dataset_by_city = list(
        filter(lambda c: c["city"] == city, metro_station_dataset)
    )
    metro_station = deepcopy(random.choice(metro_dataset_by_city))
    metro_station["color"] = rgb2hex(*metro_station["color"])
    return metro_station


def datetime_current_year():
    current_year = datetime.datetime().now().year
    return datetime.datetime(start=current_year, end=current_year)


def get_images_in_gender(images: list[str], gender: str):
    images_in_gender = list(
        filter(
            lambda c: gender
                      in gender_detector.get_gender(
                " ".join(c.split("/")[-1].split("-")[:1]).capitalize()
            ).split("_"),
            images,
        )
    )
    return images_in_gender


def upload_images_to_storage(supabase: Client):
    res = defaultdict(list)
    for dir in pathlib.Path(__file__).parent.joinpath("images").iterdir():
        res.setdefault(dir.name, [])
        logger.debug(dir.name)
        bucket_files = supabase.storage.from_(dir.name).list(
            path=dir.name,
        )
        if len(bucket_files) > 0:
            continue
        for file in dir.iterdir():
            supabase.storage.from_(dir.name).upload(
                path=file.name,
                file=file.read_bytes(),
                file_options={"upsert": "true"},
            )
            url = supabase.storage.from_(dir.name).get_public_url(path=file.name)
            res[dir.name].append(url)
    return res


async def generate_profiles(supabase: Client, num_profiles=10, *, images: list[str]):
    profiles = []
    interest_areas = await prisma.interest_areas.find_many()
    for i in range(num_profiles):
        await asyncio.sleep(0.5)
        logger.debug(i)
        email = person.email()
        user = supabase.auth.sign_up(
            gotrue.types.SignUpWithEmailAndPasswordCredentials(
                email=email, password=email
            )
        )
        if user.user:
            gender = random.choice([enums.gender.male, enums.gender.female])
            images_in_gender = get_images_in_gender(images, gender)
            profiles.append(
                {
                    "id": user.user.id,
                    "full_name": person.full_name(gender=Gender(gender)),
                    "dob": datetime.datetime(start=1990, end=2005),
                    "gender": gender,
                    "avatar": random.choice(images_in_gender),
                    "bio": random.choice(profile_bio_dataset),
                    "interest_areas": random.choices(
                        [x.name for x in interest_areas], k=3
                    ),
                }
            )
    await prisma.profiles.create_many(data=profiles)


async def generate_profile_socials(profiles: list[models.profiles]):
    profile_soc = []
    for i, profile in enumerate(profiles):
        logger.debug(i)
        profile_soc.append(
            {
                "profile_id": profile.id,
                "vk": person.username(),
                "telegram": person.username(),
            }
        )
    await prisma.profile_socials.create_many(data=profile_soc)


async def generate_profile_universities(profiles):
    profile_universities = []
    higher_education_specialties = await prisma.higher_education_specialties.find_many(
        where={"qualification": "Бакалавр"}
    )
    for i, profile in enumerate(profiles):
        logger.debug(i)
        university = random.choice(university_dataset)
        profile_universities.append(
            {
                "profile_id": profile.id,
                "university_name": university["name"],
                "university_address": university["address"],
                "geo_lat": university["geo_lat"],
                "geo_lon": university["geo_lon"],
                "graduation_year": datetime.year(minimum=datetime.datetime().year),
                "specialty_id": random.choice(higher_education_specialties).id,
            }
        )
    await prisma.profile_universities.create_many(data=profile_universities)


async def generate_roommates(profiles: list[models.profiles]):
    roommates: list[types.roommatesCreateWithoutRelationsInput] = []
    for i, profile in enumerate(profiles):
        logger.debug(i)
        university = list(
            filter(
                lambda c: c["name"] == profile.profile_universities.university_name,
                university_dataset,
            )
        )
        address_list_by_university = list(
            filter(lambda c: c["city"] == university[0]["city"], address_dataset)
        )
        addr = random.choice(address_list_by_university)
        roommates.append(
            {
                "profile_id": profile.id,
                "title": random.choice(roommate_titles),
                "description": random.choice(roommate_descriptions),
                "address": addr["address"],
                "address_data": Json(
                    {
                        "city": addr["city"],
                        "city_with_type": addr["city_with_type"],
                    }
                ),
                "geo_lat": Decimal(addr["geo_lat"]),
                "geo_lon": Decimal(addr["geo_lon"]),
                "move_in_date": datetime_current_year(),
                "budget_month": int(finance.price(minimum=15000, maximum=30000)),
                "rooms_number": [random.randint(1, 2), random.randint(3, 4)],
                "tenants_number": [random.randint(0, 1), random.randint(2, 3)],
                "tenants_age": [random.randint(18, 22), random.randint(23, 30)],
            }
        )
    await prisma.roommates.create_many(data=roommates)


async def generate_properties(profiles: list[models.profiles], *, images: list[str]):
    properties = []
    for i, profile in enumerate(profiles):
        logger.debug(i)
        university = list(
            filter(
                lambda c: c["name"] == profile.profile_universities.university_name,
                university_dataset,
            )
        )
        address_list_by_university = list(
            filter(lambda c: c["city"] == university[0]["city"], address_dataset)
        )
        addr = random.choice(address_list_by_university)
        metro_station = get_random_metro_station(addr["city"])

        properties.append(
            {
                "profile_id": profile.id,
                "title": random.choice(property_titles),
                "description": random.choice(property_descriptions),
                "images": random.choices(images, k=2),
                "address": addr["address"],
                "geo_lat": addr["geo_lat"],
                "geo_lon": addr["geo_lon"],
                "address_data": json.dumps(
                    {
                        "city": addr["city"],
                        "city_with_type": addr["city_with_type"],
                        "street_with_type": addr["street_with_type"],
                    }
                ),
                "nearest_metro_station": json.dumps(metro_station),
                "property_type": random.choice([x for x in enums.property_type]),
                "bathrooms_number": 1,
                "rent_price_month": finance.price(minimum=50000, maximum=100000),
                "stay_duration": random.choice([x for x in enums.stay_duration]),
                "bills_included": random.choice([True, False]),
                "deposit_amount": finance.price(minimum=50000, maximum=100000),
                "advertising_as": random.choice([x for x in enums.advertising_as]),
            }
        )
    await prisma.properties.create_many(data=properties)


async def generate_property_amenities(properties: list[models.properties]):
    amenities = await prisma.amenities.find_many(
        where={"category": enums.category_type.property}
    )
    property_amenities: list[types.property_amenitiesCreateWithoutRelationsInput] = []
    for i, property in enumerate(properties):
        for j, amenity in enumerate(amenities):
            logger.debug((i, j))
            property_amenities.append(
                {
                    "property_id": property.id,
                    "amenity_id": amenity.id,
                    "value": random.choice([True, False]),
                }
            )
    await prisma.property_amenities.create_many(data=property_amenities)


async def generate_roommate_in_preferences(roommates: list[models.roommates]):
    preferences = await prisma.preferences.find_many(
        where={
            "OR": [
                {"category": enums.category_type.roommate},
                {"category": enums.category_type.property},
            ]
        }
    )
    roommate_in_preferences: list[
        types.roommate_in_preferencesCreateWithoutRelationsInput
    ] = []
    for i, roommate in enumerate(roommates):
        for j, preference in enumerate(preferences):
            logger.debug((i, j))
            roommate_in_preferences.append(
                {
                    "preference_id": preference.id,
                    "roommate_id": roommate.id,
                    "value": random.choice(preference.options[:2]),
                }
            )
    await prisma.roommate_in_preferences.create_many(data=roommate_in_preferences)


async def generate_property_in_preferences(properties: list[models.properties]):
    preferences = await prisma.preferences.find_many(
        where={"category": enums.category_type.roommate}
    )
    property_in_preferences: list[
        types.property_in_preferencesCreateWithoutRelationsInput
    ] = []
    for i, property in enumerate(properties):
        for j, preference in enumerate(preferences):
            logger.debug((i, j))
            property_in_preferences.append(
                {
                    "preference_id": preference.id,
                    "property_id": property.id,
                    "value": random.choice(preference.options[:2]),
                }
            )
    await prisma.property_in_preferences.create_many(data=property_in_preferences)


async def generate_rooms(properties, *, images: list[str]):
    rooms: list[types.roomsCreateWithoutRelationsInput] = []
    for i, property in enumerate(properties):
        room_type_deque = deque([x for x in enums.room_type])
        stop = random.randint(1, 3)
        for j in range(0, stop):
            logger.debug((i, j))
            status = enums.ad_status.paused
            room_type = room_type_deque[0]
            if j + 1 == stop:
                status = enums.ad_status.active
                room_type = enums.room_type.private
            rooms.append(
                {
                    "property_id": property.id,
                    "title": random.choice(room_titles),
                    "description": random.choice(room_descriptions),
                    "images": random.choices(images, k=2),
                    "room_type": room_type,
                    "room_size": random.choice([x for x in enums.room_size]),
                    "available_from": (
                        datetime_current_year()
                        if status == enums.ad_status.active
                        else None
                    ),
                    "status": status,
                }
            )
            room_type_deque.rotate()
    random.shuffle(rooms)
    await prisma.rooms.create_many(data=rooms)


async def generate_room_tenants(rooms: list[models.rooms], *, images: list[str]):
    room_tenants = []
    for i, room in enumerate(rooms):
        if room.status != enums.ad_status.paused:
            continue
        for j in range(0, random.randint(1, 2)):
            logger.debug((i, j))
            gender = random.choice([enums.gender.female, enums.gender.male])
            images_in_gender = get_images_in_gender(images, gender)
            room_tenants.append(
                {
                    "room_id": room.id,
                    "full_name": person.full_name(gender=Gender(gender)),
                    "age": random.randint(18, 30),
                    "gender": gender,
                    "avatar": random.choice(images_in_gender),
                    "bio": random.choice(profile_bio_dataset),
                }
            )
    await prisma.room_tenants.create_many(data=room_tenants)


async def generate_room_amenities(rooms: list[models.rooms]):
    amenities = await prisma.amenities.find_many(
        where={"category": enums.category_type.room}
    )
    room_amenities: list[types.room_amenitiesCreateWithoutRelationsInput] = []
    for i, room in enumerate(rooms):
        for j, amenity in enumerate(amenities):
            logger.debug((i, j))
            room_amenities.append(
                {
                    "room_id": room.id,
                    "amenity_id": amenity.id,
                    "value": random.choice([True, False]),
                }
            )
    await prisma.room_amenities.create_many(data=room_amenities)


async def main():
    try:
        num_profiles = 12

        await prisma.connect()
        await prisma.query_raw("truncate table auth.users cascade;")

        supabase_admin_credentials = gotrue.types.SignUpWithEmailAndPasswordCredentials(
            email=settings.SUPABASE_ADMIN_EMAIL or "admin@example.com",
            password=settings.SUPABASE_ADMIN_PASSWORD or "admin@example.com",
        )
        with suppress(gotrue.errors.AuthApiError) as _:
            supabase.auth.sign_up(supabase_admin_credentials)

        supabase.auth.sign_in_with_password(
            gotrue.types.SignInWithEmailAndPasswordCredentials(
                **supabase_admin_credentials
            )
        )

        storage_images = upload_images_to_storage(supabase=supabase)

        await asyncio.sleep(1)

        await generate_profiles(
            supabase=supabase,
            num_profiles=num_profiles,
            images=storage_images["profiles"],
        )
        await asyncio.sleep(0.1)
        profiles = await prisma.profiles.find_many()
        await generate_profile_universities(profiles)
        await generate_profile_socials(profiles)

        profiles = await prisma.profiles.find_many(
            include={"profile_universities": True}
        )
        roommate_profiles = profiles[: len(profiles) // 2]
        property_profiles = profiles[len(profiles) // 2:]

        await generate_roommates(roommate_profiles)
        await asyncio.sleep(0.1)
        roommates = await prisma.roommates.find_many()
        if roommates:
            await generate_roommate_in_preferences(roommates)

        await generate_properties(
            property_profiles, images=storage_images["properties"]
        )
        await asyncio.sleep(0.1)
        properties = await prisma.properties.find_many()
        await generate_property_in_preferences(properties)
        await generate_property_amenities(properties)

        await generate_rooms(properties, images=storage_images["rooms"])
        await asyncio.sleep(0.1)
        rooms = await prisma.rooms.find_many()
        await generate_room_tenants(rooms, images=storage_images["room_tenants"])
        await generate_room_amenities(rooms)
    finally:
        await prisma.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
