from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from .config import Config

db = SQLAlchemy()

def create_app():
    app = Flask(__name__, static_folder='../frontend/dist', static_url_path='/')
    app.config.from_object(Config)
    db.init_app(app)

    with app.app_context():
        from . import routes # Import routes
        from .services import workflow_engine # Import engine to subscribe to events
        db.create_all() # Create tables

    return app