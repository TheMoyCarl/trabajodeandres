import os
import logging

logger = logging.getLogger(__name__)

# Try to load .env if python-dotenv is installed (optional)
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    # dotenv not installed or .env not present; continue using system env
    pass

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not JWT_SECRET_KEY:
    # Fallback for local development only — do NOT use in production
    JWT_SECRET_KEY = os.getenv('SECRET_KEY') or 'dev_default_jwt_secret_change_me'
    logger.warning("JWT_SECRET_KEY not set in environment — using development fallback. Do not use this in production.")

JWT_TOKEN_LOCATION = ["headers"]
JWT_ACCESS_TOKEN_EXPIRES = 3600
JWT_HEADER_NAME = "Authorization"
JWT_HEADER_TYPE = "Bearer"