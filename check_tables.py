from sqlalchemy import inspect
from config.database import engine

# Inspeccionar las tablas existentes en la base de datos
inspector = inspect(engine)
tables = inspector.get_table_names()

if tables:
    print("Tablas existentes en la base de datos:")
    for table in tables:
        print(f"- {table}")
else:
    print("No se encontraron tablas en la base de datos.")