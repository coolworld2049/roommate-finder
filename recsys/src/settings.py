import pathlib

from dotenv import load_dotenv
from plombery.config.model import Settings as PlomberySettings
from prisma import register, Prisma
from supabase import Client
from supabase import create_client

load_dotenv(dotenv_path=pathlib.Path(__file__).parent.parent.joinpath(".env"))


class Settings(PlomberySettings):
    HOST: str = "localhost"
    PORT: int = 8001
    IS_DEBUG: bool = False
    SUPABASE_DATABASE_URL: str
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_ADMIN_EMAIL: str | None = None
    SUPABASE_ADMIN_PASSWORD: str | None = None


settings = Settings()  # type: ignore

prisma = Prisma()
prisma._datasource = {"url": settings.SUPABASE_DATABASE_URL}
register(prisma)

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
