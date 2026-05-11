import jwt
import hashlib
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify

SECRET_KEY = "almacen_secret_key_2024"
ALGORITHM  = "HS256"


# ── helpers ──────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def generate_token(username: str, password: str) -> str:
    payload = {
        "sub": username,
        "pwd": password,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


def extract_username(token: str) -> str:
    return decode_token(token)["sub"]


def validate_token(token: str, usuario) -> bool:
    payload = decode_token(token)
    return payload["sub"] == usuario.username and payload["pwd"] == usuario.password


# ── decorator ────────────────────────────────────────────────────────────────

def token_required(f):
    """Decorator: extracts and validates JWT; injects `current_user` into the view."""
    @wraps(f)
    def decorated(*args, **kwargs):
        from models.models import Usuario

        data  = request.get_json(silent=True) or {}
        token = data.get("token")

        if not token:
            return jsonify({"error": "Token requerido"}), 400

        try:
            username = extract_username(token)
            usuario  = Usuario.query.filter_by(username=username).first()
            if usuario is None or not validate_token(token, usuario):
                return jsonify({"error": "Credenciales incorrectas"}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expirado"}), 401
        except jwt.InvalidSignatureError:
            return jsonify({"error": "Firma JWT inválida"}), 401
        except Exception:
            return jsonify({"error": "Token inválido"}), 401

        return f(*args, current_user=usuario, **kwargs)

    return decorated
