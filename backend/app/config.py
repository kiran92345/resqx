"""
Application configuration, loaded from environment variables (.env).
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db_name: str = "resqx"
    jwt_secret: str = "change-this-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 120

    class Config:
        env_file = ".env"


settings = Settings()
