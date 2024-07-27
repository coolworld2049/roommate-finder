import json
from datetime import datetime

import pandas as pd
from apscheduler.triggers.interval import IntervalTrigger
from dateutil import tz
from plombery import register_pipeline, task, Trigger, get_logger

from model.__main__ import ContentBasedRecommendation
from model.preprocesor import Preprocessor
from settings import prisma


@task
async def generate_recommendations_task():
    logger = get_logger()
    cb = ContentBasedRecommendation()
    dataset = await Preprocessor(prisma).dataset()
    df = pd.DataFrame(dataset)
    logger.info(
        f"df:\n{df.head().to_json(orient='records', indent=2, force_ascii=True)}"
    )
    logs = await cb.generate_recommendations(df)
    logger.info(json.dumps(logs, indent=2))


register_pipeline(
    id="generate_recommendations",
    tasks=[generate_recommendations_task],
    triggers=[
        Trigger(
            id="nigthly",
            name="Nigthly",
            description="Run the pipeline every night",
            schedule=IntervalTrigger(
                days=1,
                start_date=datetime.now(tz=tz.gettz("Europe/Moscow")).replace(hour=3),
            ),
        )
    ],
)
