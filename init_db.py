from config.database import Base, engine
from models.user_model import User

# Crear todas las tablas
Base.metadata.create_all(bind=engine)
print("Tablas creadas exitosamente.")