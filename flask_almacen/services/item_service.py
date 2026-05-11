from models.models import db, Item, Almacen


def get_items(data: dict, current_user):
    almacen_id = data.get("id")
    if almacen_id is None:
        return {"error": "El campo 'id' (almacen) es requerido"}, 400

    try:
        almacen_id = int(almacen_id)
    except (ValueError, TypeError):
        return {"error": "'id' debe ser un entero"}, 400

    almacen = Almacen.query.get(almacen_id)
    if almacen is None or almacen.usuario_id != current_user.id:
        return {"error": "No autorizado"}, 401

    items = Item.query.filter_by(almacen_id=almacen_id).all()
    return [i.to_dict() for i in items], 200


def create_item(data: dict, current_user):
    almacen_id  = data.get("id")
    nombre      = data.get("nombre", "").strip()
    descripcion = data.get("descripcion", "").strip()

    if not almacen_id or not nombre or not descripcion:
        return {"error": "Los campos 'id', 'nombre' y 'descripcion' son requeridos"}, 400

    try:
        almacen_id = int(almacen_id)
    except (ValueError, TypeError):
        return {"error": "'id' debe ser un entero"}, 400

    almacen = Almacen.query.get(almacen_id)
    if almacen is None:
        return {"error": "Almacen no encontrado"}, 404
    if almacen.usuario_id != current_user.id:
        return {"error": "No autorizado"}, 401

    # Regla de negocio: verificar capacidad
    if almacen.items_almacenados >= almacen.capacidad_total:
        return {"error": "No se pueden agregar mas items al almacen"}, 400

    item = Item(nombre=nombre, descripcion=descripcion, almacen_id=almacen_id)
    almacen.items_almacenados += 1

    db.session.add(item)
    db.session.commit()
    return {"mensaje": "Nuevo item agregado", "item": item.to_dict()}, 201


def get_item(item_id: int, current_user):
    item = Item.query.get(item_id)
    if item is None:
        return {"error": "Item no encontrado"}, 404

    almacen = Almacen.query.get(item.almacen_id)
    if almacen.usuario_id != current_user.id:
        return {"error": "No autorizado"}, 401

    return item.to_dict(), 200


def update_item(item_id: int, data: dict, current_user):
    item = Item.query.get(item_id)
    if item is None:
        return {"error": "Item no encontrado"}, 404

    almacen = Almacen.query.get(item.almacen_id)
    if almacen.usuario_id != current_user.id:
        return {"error": "No autorizado"}, 401

    if "nombre" in data and data["nombre"].strip():
        item.nombre = data["nombre"].strip()
    if "descripcion" in data and data["descripcion"].strip():
        item.descripcion = data["descripcion"].strip()

    db.session.commit()
    return {"mensaje": "Item actualizado", "item": item.to_dict()}, 200


def delete_item(item_id: int, current_user):
    item = Item.query.get(item_id)
    if item is None:
        return {"error": "Item no encontrado"}, 404

    almacen = Almacen.query.get(item.almacen_id)
    if almacen.usuario_id != current_user.id:
        return {"error": "No autorizado"}, 401

    almacen.items_almacenados -= 1
    db.session.delete(item)
    db.session.commit()
    return {"mensaje": "Item eliminado"}, 200
