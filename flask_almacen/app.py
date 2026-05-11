import os
from flask import Flask
from models.models import db
from routes.usuario_routes  import usuario_bp
from routes.almacen_routes  import almacen_bp
from routes.item_routes     import item_bp
from routes.historial_routes import historial_bp
from flask_cors import CORS


def create_app():
    app = Flask(__name__)

    # ── Base de datos (SQLite por defecto, configurable via env) ──────────────
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL", "sqlite:///almacen.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    CORS(app, origins=["http://localhost:5173"])
    db.init_app(app)

    with app.app_context():
        db.create_all()

    # ── Blueprints ────────────────────────────────────────────────────────────
    app.register_blueprint(usuario_bp)
    app.register_blueprint(almacen_bp)
    app.register_blueprint(item_bp)
    app.register_blueprint(historial_bp)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
