from __future__ import annotations
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    # Database
    DATABASE_HOSTNAME: str
    DATABASE_PORT: str
    DATABASE_USERNAME: str
    DATABASE_PASSWORD: str
    DATABASE_NAME: str
    
    # Gemini API info
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.3-70b-versatile"


    # App details
    APP_NAME: str = "Naija Learn"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    model_config=SettingsConfigDict(env_file=".env")

    @property
    def DATABASE_URL(self) -> str:
        return(
            f"postgresql+asyncpg://{self.DATABASE_USERNAME}:"
            f"{self.DATABASE_PASSWORD}@{self.DATABASE_HOSTNAME}:"
            F"{self.DATABASE_PORT}/{self.DATABASE_NAME}"
            )
    
settings = Settings() # type: ignore
    