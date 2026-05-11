from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom.minidom import parseString
from collections import Counter
from datetime import date
from models.models import Almacen, Item, HistorialTransferencias


def generar_informe(current_user) -> tuple[str, int]:
    """Genera el informe XML completo para el usuario autenticado."""

    almacenes = Almacen.query.filter_by(usuario_id=current_user.id).all()

    # IDs de almacenes del usuario
    almacen_ids = {a.id for a in almacenes}

    # Items que pertenecen a almacenes del usuario
    items = Item.query.filter(Item.almacen_id.in_(almacen_ids)).all() if almacen_ids else []

    # Historial del usuario
    historial = HistorialTransferencias.query.filter_by(usuario_id=current_user.id).all()

    # ── Métricas globales ────────────────────────────────────────────────────
    total_almacenes       = len(almacenes)
    total_items           = len(items)
    capacidad_total_global = sum(a.capacidad_total for a in almacenes)
    items_almacenados_global = sum(a.items_almacenados for a in almacenes)

    pct_ocupacion_global = (
        round(items_almacenados_global / capacidad_total_global * 100, 2)
        if capacidad_total_global > 0 else 0.0
    )

    pct_por_almacen = [
        round(a.items_almacenados / a.capacidad_total * 100, 2)
        if a.capacidad_total > 0 else 0.0
        for a in almacenes
    ]
    pct_media = (
        round(sum(pct_por_almacen) / len(pct_por_almacen), 2)
        if pct_por_almacen else 0.0
    )

    total_transferencias = len(historial)

    # Top 5 items con más transferencias
    conteo_items = Counter(h.item_id for h in historial)
    top5_ids = conteo_items.most_common(5)

    # Mapa id → nombre de item
    item_map = {i.id: i.nombre for i in items}
    # Items de otros almacenes que pudieran aparecer en historial del usuario
    extra_ids = {iid for iid, _ in top5_ids if iid not in item_map}
    if extra_ids:
        extras = Item.query.filter(Item.id.in_(extra_ids)).all()
        for e in extras:
            item_map[e.id] = e.nombre

    # ── Construcción del XML ─────────────────────────────────────────────────
    root = Element("informe")
    root.set("usuario", current_user.username)
    root.set("fecha_generacion", str(date.today()))

    # Resumen global
    resumen = SubElement(root, "resumen")
    SubElement(resumen, "total_almacenes").text       = str(total_almacenes)
    SubElement(resumen, "total_items").text           = str(total_items)
    SubElement(resumen, "capacidad_total").text       = str(capacidad_total_global)
    SubElement(resumen, "items_almacenados").text     = str(items_almacenados_global)
    SubElement(resumen, "pct_ocupacion_global").text  = str(pct_ocupacion_global)
    SubElement(resumen, "pct_ocupacion_media").text   = str(pct_media)
    SubElement(resumen, "total_transferencias").text  = str(total_transferencias)

    # Detalle de almacenes
    detalle_almacenes = SubElement(root, "almacenes")
    for a, pct in zip(almacenes, pct_por_almacen):
        alm_el = SubElement(detalle_almacenes, "almacen")
        alm_el.set("id", str(a.id))
        SubElement(alm_el, "capacidad_total").text   = str(a.capacidad_total)
        SubElement(alm_el, "items_almacenados").text = str(a.items_almacenados)
        SubElement(alm_el, "pct_ocupacion").text     = str(pct)

    # Top 5 items con más transferencias
    top5_el = SubElement(root, "top5_items_transferidos")
    for rank, (item_id, cantidad) in enumerate(top5_ids, start=1):
        item_el = SubElement(top5_el, "item")
        item_el.set("rank", str(rank))
        SubElement(item_el, "id").text          = str(item_id)
        SubElement(item_el, "nombre").text      = item_map.get(item_id, "Desconocido")
        SubElement(item_el, "transferencias").text = str(cantidad)

    # Serializar con indentado
    xml_raw  = tostring(root, encoding="unicode")
    xml_pretty = parseString(xml_raw).toprettyxml(indent="  ")

    return xml_pretty, 200
