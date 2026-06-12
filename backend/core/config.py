from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartLink API"
    DATABASE_URL: str = "sqlite:///./smartlink.db" # Default to sqlite for local dev, will override with Neon Postgres URL via .env
    SECRET_KEY: str = "change-this-in-production-very-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # API Keys
    GEMINI_API_KEY: str | None = None
    OPENAI_API_KEY: str | None = None
    VIRUSTOTAL_API_KEY: str | None = None
    GOOGLE_SAFE_BROWSING_API_KEY: str | None = None
    
    # OAuth
    GOOGLE_CLIENT_ID: str | None = None
    GOOGLE_CLIENT_SECRET: str | None = None

    class Config:
        env_file = ".env"

settings = Settings()
