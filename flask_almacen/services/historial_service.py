from datetime import date
from models.models import db, HistorialTransferencias, Almacen, Item


def get_historial(current_user):
    registros = HistorialTransferencias.query.filter_by(usuario_id=current_user.id).all()
    return [r.to_dict() for r in registros], 200


def create_transferencia(data: dict, current_user):
    almacen_origen_id  = data.get("almacenOrigenId")
    almacen_destino_id = data.get("almacenDestinoId")
    item_id            = data.get("itemId")

    if not almacen_origen_id or not almacen_destino_id or not item_id:
        return {"error": "Los campos 'almacenOrigenId', 'almacenDestinoId' e 'itemId' son requeridos"}, 400

    try:
        almacen_origen_id  = int(almacen_origen_id)
        almacen_destino_id = int(almacen_destino_id)
        item_id            = int(item_id)
    except (ValueError, TypeError):
        return {"error": "Los IDs deben ser enteros"}, 400

    almacen_origen  = Almacen.query.get(almacen_origen_id)
    almacen_destino = Almacen.query.get(almacen_destino_id)
    item            = Item.query.get(item_id)

    if not almacen_origen or not almacen_destino or not item:
        return {"error": "Almacen u item no encontrado"}, 404

    # Regla de negocio: el item debe estar en el almacen origen
    if item.almacen_id != almacen_origen_id:
        return {"error": "El item no se encuentra en el almacen origen"}, 400

    # Regla de negocio: el almacen destino debe tener espacio
    if almacen_destino.items_almacenados >= almacen_destino.capacidad_total:
        return {"error": "El almacen destino no tiene suficiente espacio"}, 400

    # Ejecutar transferencia
    almacen_origen.items_almacenados  -= 1
    almacen_destino.items_almacenados += 1
    item.almacen_id = almacen_destino_id

    historial = HistorialTransferencias(
        fecha=date.today(),
        almacen_origen_id=almacen_origen_id,
        almacen_destino_id=almacen_destino_id,
        item_id=item_id,
        usuario_id=current_user.id,
    )
    db.session.add(historial)
    db.session.commit()
    return {"mensaje": "Se ha transferido el item con exito", "historial": historial.to_dict()}, 201


def get_transferencia(historial_id: int, current_user):
    h = HistorialTransferencias.query.get(historial_id)
    if h is None:
        return {"error": "Registro no encontrado"}, 404
    if h.usuario_id != current_user.id:
        return {"error": "No autorizado"}, 401
    return h.to_dict(), 200


def delete_transferencia(historial_id: int, current_user):
    """Elimina un registro del historial (solo el registro, no revierte la transferencia)."""
    h = HistorialTransferencias.query.get(historial_id)
    if h is None:
        return {"error": "Registro no encontrado"}, 404
    if h.usuario_id != current_user.id:
        return {"error": "No autorizado"}, 401
    db.session.delete(h)
    db.session.commit()
    return {"mensaje": "Registro de historial eliminado"}, 200
