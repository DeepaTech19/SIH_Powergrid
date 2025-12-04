# create_tables.py
from database import engine, Base
import models  # noqa: F401 (needed so models are registered)

if __name__ == "__main__":
    print("Creating tables in sih.db ...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")
