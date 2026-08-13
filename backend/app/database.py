"""
Motor (async MongoDB) client and collection accessors.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = AsyncIOMotorClient(settings.mongo_uri)
db = client[settings.mongo_db_name]

incidents_collection = db["incidents"]
resources_collection = db["resources"]
allocations_collection = db["allocations"]
users_collection = db["users"]
