from flask import Blueprint, request, jsonify
from services import usuario_service
from utils.jwt_utils import token_required

usuario_bp = Blueprint("usuario", __name__, url_prefix="/api/usuario")


@usuario_bp.post("/signup")
def signup():
    data = request.get_json(silent=True) or {}
    result, status = usuario_service.sign_up(data)
    return jsonify(result), status


@usuario_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    result, status = usuario_service.login(data)
    return jsonify(result), status


@usuario_bp.get("/")
@token_required
def get_all(current_user):
    result, status = usuario_service.get_all_usuarios()
    return jsonify(result), status


@usuario_bp.get("/<int:usuario_id>")
@token_required
def get_one(current_user, usuario_id):
    result, status = usuario_service.get_usuario(usuario_id)
    return jsonify(result), status


@usuario_bp.put("/<int:usuario_id>")
@token_required
def update(current_user, usuario_id):
    data = request.get_json(silent=True) or {}
    result, status = usuario_service.update_usuario(usuario_id, data)
    return jsonify(result), status


@usuario_bp.delete("/<int:usuario_id>")
@token_required
def delete(current_user, usuario_id):
    result, status = usuario_service.delete_usuario(usuario_id)
    return jsonify(result), status
