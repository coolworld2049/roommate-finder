from plombery import get_app, settings as plombery_settings  # noqa: F401

from scheduler.src import generate_recommendations  # noqa: F401
from settings import settings

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(get_app, factory=True, port=settings.PORT, host=settings.HOST)
