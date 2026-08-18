from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):

    # Database
    DATABASE_HOSTNAME: str
    DATABASE_PORT: str
    DATABASE_USERNAME: str
    DATABASE_PASSWORD: str
    DATABASE_NAME: str

    # If DATABASE_URL is provided, it will override the individual database settings
    DATABASE_URL_OVERRIDE: Optional[str] = None

    # Gemini API info
    GROQ_API_KEY: str
    GROQ_MODEL: str = "openai/gpt-oss-120b"


    # App details
    APP_NAME: str = "Naija Learn"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    model_config=SettingsConfigDict(env_file=".env")

    @property
    def DATABASE_URL(self) -> str:
        if self.DATABASE_URL_OVERRIDE:
            url = self.DATABASE_URL_OVERRIDE
            if url.startswith("postgresql://"):
                url = url.replace("postgresql://", "postgresql+asyncpg://")
            return url

        # Otherwise, construct the database URL from individual settings
        return(
            f"postgresql+asyncpg://{self.DATABASE_USERNAME}:"
            f"{self.DATABASE_PASSWORD}@{self.DATABASE_HOSTNAME}:"
            f"{self.DATABASE_PORT}/{self.DATABASE_NAME}"
            )
    
settings = Settings() # type: ignore
    