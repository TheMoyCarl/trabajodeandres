import os
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY") or 'dev_default_jwt_secret_change_me'
JWT_TOKEN_LOCATION = ["headers"]
JWT_ACCESS_TOKEN_EXPIRES = 3600
JWT_HEADER_NAME = "Authorization"
JWT_HEADER_TYPE = "Bearer"