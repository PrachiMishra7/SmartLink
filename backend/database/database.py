from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.core.config import settings

# pool_pre_ping=True: validates connections before use, auto-reconnects if DB restarted
_is_sqlite = settings.DATABASE_URL.startswith("sqlite")

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if _is_sqlite else {},
    # Postgres-safe pool settings
    **({} if _is_sqlite else {
        "pool_pre_ping": True,      # detect dropped connections
        "pool_size": 5,             # keep 5 connections warm
        "max_overflow": 10,         # allow up to 10 more on burst
        "pool_recycle": 1800,       # recycle after 30 minutes
        "pool_timeout": 30,         # wait max 30s for a slot
    })
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
