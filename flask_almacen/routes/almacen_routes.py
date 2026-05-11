from flask import Blueprint, request, jsonify
from services import almacen_service
from utils.jwt_utils import token_required

almacen_bp = Blueprint("almacen", __name__, url_prefix="/api/almacen")


@almacen_bp.post("/")
@token_required
def get_all(current_user):
    result, status = almacen_service.get_almacenes(current_user)
    return jsonify(result), status


@almacen_bp.put("/")
@token_required
def create(current_user):
    data = request.get_json(silent=True) or {}
    result, status = almacen_service.create_almacen(data, current_user)
    return jsonify(result), status


@almacen_bp.get("/<int:almacen_id>")
@token_required
def get_one(current_user, almacen_id):
    result, status = almacen_service.get_almacen(almacen_id, current_user)
    return jsonify(result), status


@almacen_bp.put("/<int:almacen_id>")
@token_required
def update(current_user, almacen_id):
    data = request.get_json(silent=True) or {}
    result, status = almacen_service.update_almacen(almacen_id, data, current_user)
    return jsonify(result), status


@almacen_bp.delete("/<int:almacen_id>")
@token_required
def delete(current_user, almacen_id):
    result, status = almacen_service.delete_almacen(almacen_id, current_user)
    return jsonify(result), status
