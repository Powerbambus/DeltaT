from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    secret_key: str
    access_token_expire_minutes: int = 60 * 24 * 7
    algorithm: str = "HS256"

    class Config:
        env_prefix = "DELTAT_"
        env_file = ".env"


settings = Settings()
