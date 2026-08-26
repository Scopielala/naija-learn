from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    # Database individual parts — optional when DATABASE_URL_OVERRIDE is set
    DATABASE_HOSTNAME: str = "localhost"
    DATABASE_PORT: str = "5432"
    DATABASE_USERNAME: str = "postgres"
    DATABASE_PASSWORD: str = "NaijaLearn2024"
    DATABASE_NAME: str = "naija_learn"

    # Railway provides this — takes priority over individual parts
    DATABASE_URL_OVERRIDE: Optional[str] = None

    # Groq API — required, no default
    GROQ_API_KEY: str

    # App settings with defaults
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    APP_NAME: str = "Naija Learn"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    model_config = SettingsConfigDict(env_file=".env")

    @property
    def DATABASE_URL(self) -> str:
        if self.DATABASE_URL_OVERRIDE:
            url = self.DATABASE_URL_OVERRIDE
            if url.startswith("postgresql://"):
                url = url.replace(
                    "postgresql://",
                    "postgresql+asyncpg://",
                    1
                )
            return url

        return (
            f"postgresql+asyncpg://{self.DATABASE_USERNAME}:"
            f"{self.DATABASE_PASSWORD}@{self.DATABASE_HOSTNAME}:"
            f"{self.DATABASE_PORT}/{self.DATABASE_NAME}"
        )


settings = Settings()  # type: ignore