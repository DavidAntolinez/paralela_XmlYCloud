from flask import Blueprint, request, jsonify
from services import historial_service
from utils.jwt_utils import token_required

historial_bp = Blueprint("historial", __name__, url_prefix="/api/historial")


@historial_bp.post("/")
@token_required
def get_all(current_user):
    result, status = historial_service.get_historial(current_user)
    return jsonify(result), status


@historial_bp.put("/")
@token_required
def create(current_user):
    data = request.get_json(silent=True) or {}
    result, status = historial_service.create_transferencia(data, current_user)
    return jsonify(result), status


@historial_bp.get("/<int:historial_id>")
@token_required
def get_one(current_user, historial_id):
    result, status = historial_service.get_transferencia(historial_id, current_user)
    return jsonify(result), status


@historial_bp.delete("/<int:historial_id>")
@token_required
def delete(current_user, historial_id):
    result, status = historial_service.delete_transferencia(historial_id, current_user)
    return jsonify(result), status
