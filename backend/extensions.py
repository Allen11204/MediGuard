from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

db = SQLAlchemy() # ORM object, single instance for whole app
bcrypt = Bcrypt()
