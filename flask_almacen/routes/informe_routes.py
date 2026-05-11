from flask import Blueprint, Response
from utils.jwt_utils import token_required
from services.informe_service import generar_informe

informe_bp = Blueprint("informe", __name__, url_prefix="/api/informe")


@informe_bp.post("/")
@token_required
def get_informe(current_user):
    """Devuelve el informe XML como texto plano para visualizar en el frontend."""
    xml_str, status = generar_informe(current_user)
    return Response(xml_str, status=status, mimetype="application/xml")


@informe_bp.post("/descargar")
@token_required
def descargar_informe(current_user):
    """Descarga el informe como archivo .xml."""
    xml_str, status = generar_informe(current_user)
    return Response(
        xml_str,
        status=status,
        mimetype="application/xml",
        headers={
            "Content-Disposition": f"attachment; filename=informe_{current_user.username}.xml"
        },
    )
