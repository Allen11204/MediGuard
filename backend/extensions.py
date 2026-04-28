from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

db = SQLAlchemy()  # ORM client for all database operations
bcrypt = Bcrypt()  # password hashing utility
