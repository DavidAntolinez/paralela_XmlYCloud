from models.models import db, Almacen


def get_almacenes(current_user):
    almacenes = Almacen.query.filter_by(usuario_id=current_user.id).all()
    return [a.to_dict() for a in almacenes], 200


def create_almacen(data: dict, current_user):
    tamaño = data.get("tamaño")
    if tamaño is None:
        return {"error": "El campo 'tamaño' es requerido"}, 400

    try:
        capacidad = int(tamaño)
        if capacidad < 1:
            raise ValueError
    except (ValueError, TypeError):
        return {"error": "'tamaño' debe ser un entero positivo"}, 400

    almacen = Almacen(
        capacidad_total=capacidad,
        items_almacenados=0,
        usuario_id=current_user.id,
    )
    db.session.add(almacen)
    db.session.commit()
    return {"mensaje": "Nuevo almacen agregado", "almacen": almacen.to_dict()}, 201


def get_almacen(almacen_id: int, current_user):
    almacen = Almacen.query.get(almacen_id)
    if almacen is None:
        return {"error": "Almacen no encontrado"}, 404
    if almacen.usuario_id != current_user.id:
        return {"error": "No autorizado"}, 401
    return almacen.to_dict(), 200


def update_almacen(almacen_id: int, data: dict, current_user):
    almacen = Almacen.query.get(almacen_id)
    if almacen is None:
        return {"error": "Almacen no encontrado"}, 404
    if almacen.usuario_id != current_user.id:
        return {"error": "No autorizado"}, 401

    if "tamaño" in data:
        try:
            nueva_capacidad = int(data["tamaño"])
            if nueva_capacidad < almacen.items_almacenados:
                return {"error": "La nueva capacidad no puede ser menor a los items actuales"}, 400
            almacen.capacidad_total = nueva_capacidad
        except (ValueError, TypeError):
            return {"error": "'tamaño' debe ser un entero positivo"}, 400

    db.session.commit()
    return {"mensaje": "Almacen actualizado", "almacen": almacen.to_dict()}, 200


def delete_almacen(almacen_id: int, current_user):
    almacen = Almacen.query.get(almacen_id)
    if almacen is None:
        return {"error": "Almacen no encontrado"}, 404
    if almacen.usuario_id != current_user.id:
        return {"error": "No autorizado"}, 401
    if almacen.items_almacenados > 0:
        return {"error": "No se puede eliminar un almacen con items"}, 400

    db.session.delete(almacen)
    db.session.commit()
    return {"mensaje": "Almacen eliminado"}, 200
