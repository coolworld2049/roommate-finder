FROM python:3.11.7-slim-bullseye as recommendation_service

RUN apt update && apt -y install libpq-dev gcc

RUN pip install poetry==1.4.2

WORKDIR /app

COPY pyproject.toml poetry.lock /app/

RUN poetry config virtualenvs.create false

RUN poetry install -n

COPY src .

COPY scripts scripts

COPY schema.prisma schema.prisma

RUN ./scripts/prestart.sh