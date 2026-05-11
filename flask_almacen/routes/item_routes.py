from flask import Blueprint, request, jsonify
from services import item_service
from utils.jwt_utils import token_required

item_bp = Blueprint("item", __name__, url_prefix="/api/item")


@item_bp.post("/")
@token_required
def get_all(current_user):
    """POST porque el token viene en el body (igual que el original)."""
    data = request.get_json(silent=True) or {}
    result, status = item_service.get_items(data, current_user)
    return jsonify(result), status


@item_bp.put("/")
@token_required
def create(current_user):
    data = request.get_json(silent=True) or {}
    result, status = item_service.create_item(data, current_user)
    return jsonify(result), status


@item_bp.get("/<int:item_id>")
@token_required
def get_one(current_user, item_id):
    result, status = item_service.get_item(item_id, current_user)
    return jsonify(result), status


@item_bp.patch("/<int:item_id>")
@token_required
def update(current_user, item_id):
    data = request.get_json(silent=True) or {}
    result, status = item_service.update_item(item_id, data, current_user)
    return jsonify(result), status


@item_bp.delete("/<int:item_id>")
@token_required
def delete(current_user, item_id):
    result, status = item_service.delete_item(item_id, current_user)
    return jsonify(result), status
