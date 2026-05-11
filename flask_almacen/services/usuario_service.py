from models.models import db, Usuario
from utils.jwt_utils import hash_password, generate_token


def sign_up(data: dict):
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return {"error": "username y password son requeridos"}, 400

    if Usuario.query.filter_by(username=username).first():
        return {"error": "Este usuario ya existe"}, 400

    nuevo = Usuario(username=username, password=hash_password(password))
    db.session.add(nuevo)
    db.session.commit()
    return {"mensaje": "Usuario registrado correctamente"}, 201


def login(data: dict):
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return {"error": "username y password son requeridos"}, 400

    usuario = Usuario.query.filter_by(username=username).first()
    if usuario is None or usuario.password != hash_password(password):
        return {"error": "Credenciales incorrectas"}, 400

    token = generate_token(usuario.username, usuario.password)
    return {"token": token}, 200


# ── CRUD adicional ────────────────────────────────────────────────────────────

def get_all_usuarios():
    return [u.to_dict() for u in Usuario.query.all()], 200


def get_usuario(usuario_id: int):
    u = Usuario.query.get(usuario_id)
    if u is None:
        return {"error": "Usuario no encontrado"}, 404
    return u.to_dict(), 200


def update_usuario(usuario_id: int, data: dict):
    u = Usuario.query.get(usuario_id)
    if u is None:
        return {"error": "Usuario no encontrado"}, 404

    if "username" in data and data["username"].strip():
        u.username = data["username"].strip()
    if "password" in data and data["password"].strip():
        u.password = hash_password(data["password"].strip())

    db.session.commit()
    return {"mensaje": "Usuario actualizado", "usuario": u.to_dict()}, 200


def delete_usuario(usuario_id: int):
    u = Usuario.query.get(usuario_id)
    if u is None:
        return {"error": "Usuario no encontrado"}, 404
    db.session.delete(u)
    db.session.commit()
    return {"mensaje": "Usuario eliminado"}, 200
