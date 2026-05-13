"""
informe_service.py
Genera un documento XML completo con todas las partes estándar:
  - Declaración XML  (prólogo: versión, encoding, standalone)
  - Instrucción de procesamiento  (generador del documento)
  - DTD interno  (declara los elementos y sus relaciones)
  - Comentarios  (documentan cada sección del árbol)
  - Namespaces  (xmlns en el elemento raíz)
  - CDATA  (protege caracteres especiales en texto libre)
  - Elementos y atributos  (datos del informe)
"""

from collections import Counter
from datetime import datetime, date, timezone
from models.models import Almacen, Item, HistorialTransferencias

# ── Namespace del informe ─────────────────────────────────────────────────────
XMLNS = "http://almacen.app/informe/v1"


def _cdata(text: str) -> str:
    """Envuelve texto en una sección CDATA para proteger caracteres especiales."""
    safe = text.replace("]]>", "]]]]><![CDATA[>")
    return f"<![CDATA[{safe}]]>"


def _pct(parte: int, total: int) -> str:
    if total == 0:
        return "0.00"
    return f"{round(parte / total * 100, 2):.2f}"


def generar_informe(current_user) -> tuple[str, int]:
    """Genera el informe XML completo para el usuario autenticado."""

    # ── Consultas ─────────────────────────────────────────────────────────────
    almacenes   = Almacen.query.filter_by(usuario_id=current_user.id).all()
    almacen_ids = {a.id for a in almacenes}
    items       = (Item.query.filter(Item.almacen_id.in_(almacen_ids)).all()
                   if almacen_ids else [])
    historial   = HistorialTransferencias.query.filter_by(usuario_id=current_user.id).all()

    # ── Métricas ──────────────────────────────────────────────────────────────
    total_almacenes        = len(almacenes)
    total_items            = len(items)
    capacidad_total_global = sum(a.capacidad_total   for a in almacenes)
    almacenados_global     = sum(a.items_almacenados for a in almacenes)
    pct_global             = _pct(almacenados_global, capacidad_total_global)

    pct_por_almacen = [_pct(a.items_almacenados, a.capacidad_total) for a in almacenes]
    pct_media = (
        f"{round(sum(float(p) for p in pct_por_almacen) / len(pct_por_almacen), 2):.2f}"
        if pct_por_almacen else "0.00"
    )

    total_transferencias = len(historial)
    conteo_items         = Counter(h.item_id for h in historial)
    top5                 = conteo_items.most_common(5)

    item_map  = {i.id: i.nombre for i in items}
    extra_ids = {iid for iid, _ in top5 if iid not in item_map}
    if extra_ids:
        for e in Item.query.filter(Item.id.in_(extra_ids)).all():
            item_map[e.id] = e.nombre

    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    # ── DTD interno ───────────────────────────────────────────────────────────
    dtd = """<!DOCTYPE informe [
  <!ELEMENT informe (metadata, resumen, almacenes, top5_items_transferidos)>
  <!ATTLIST informe
    xmlns             CDATA #REQUIRED
    usuario           CDATA #REQUIRED
    fecha_generacion  CDATA #REQUIRED
    generado_en       CDATA #REQUIRED
  >
  <!ELEMENT metadata (sistema, version, descripcion)>
  <!ELEMENT sistema     (#PCDATA)>
  <!ELEMENT version     (#PCDATA)>
  <!ELEMENT descripcion (#PCDATA)>
  <!ELEMENT resumen (
    total_almacenes, total_items, capacidad_total,
    items_almacenados, pct_ocupacion_global,
    pct_ocupacion_media, total_transferencias
  )>
  <!ELEMENT total_almacenes      (#PCDATA)>
  <!ELEMENT total_items          (#PCDATA)>
  <!ELEMENT capacidad_total      (#PCDATA)>
  <!ELEMENT items_almacenados    (#PCDATA)>
  <!ELEMENT pct_ocupacion_global (#PCDATA)>
  <!ELEMENT pct_ocupacion_media  (#PCDATA)>
  <!ELEMENT total_transferencias (#PCDATA)>
  <!ELEMENT almacenes (almacen*)>
  <!ELEMENT almacen   (capacidad_total, items_almacenados, pct_ocupacion)>
  <!ATTLIST almacen id CDATA #REQUIRED>
  <!ELEMENT pct_ocupacion (#PCDATA)>
  <!ELEMENT top5_items_transferidos (item*)>
  <!ELEMENT item (id, nombre, transferencias)>
  <!ATTLIST item rank CDATA #REQUIRED>
  <!ELEMENT id             (#PCDATA)>
  <!ELEMENT nombre         (#PCDATA)>
  <!ELEMENT transferencias (#PCDATA)>
]>"""

    # ── Construcción como string ──────────────────────────────────────────────
    lines = []

    # 1. Declaración XML — prólogo completo
    lines.append('<?xml version="1.0" encoding="UTF-8" standalone="no"?>')

    # 2. Instrucción de procesamiento — identifica el generador
    lines.append('<?almacen-app generador="flask-api" version="1.0"?>')

    # 3. Comentarios de cabecera
    lines.append(f"<!-- Informe de gestión de almacenes generado el {now_iso} -->")
    lines.append(f"<!-- Usuario: {current_user.username} | Sistema: Almacén App v1.0 -->")

    # 4. DTD interno
    lines.append(dtd)

    # 5. Elemento raíz con namespace y atributos
    lines.append(
        f'<informe xmlns="{XMLNS}"'
        f' usuario="{current_user.username}"'
        f' fecha_generacion="{str(date.today())}"'
        f' generado_en="{now_iso}">'
    )

    # 6. Metadatos del documento
    lines.append("  <!-- Metadatos del documento -->")
    lines.append("  <metadata>")
    lines.append("    <sistema>Almacen App</sistema>")
    lines.append("    <version>1.0</version>")
    lines.append(
        "    <descripcion>"
        + _cdata("Informe de ocupacion, inventario y transferencias de almacenes.")
        + "</descripcion>"
    )
    lines.append("  </metadata>")

    # 7. Resumen global
    lines.append("")
    lines.append("  <!-- Resumen estadistico global del usuario -->")
    lines.append("  <resumen>")
    lines.append(f"    <total_almacenes>{total_almacenes}</total_almacenes>")
    lines.append(f"    <total_items>{total_items}</total_items>")
    lines.append(f"    <capacidad_total>{capacidad_total_global}</capacidad_total>")
    lines.append(f"    <items_almacenados>{almacenados_global}</items_almacenados>")
    lines.append("    <!-- Porcentaje = items_almacenados / capacidad_total * 100 -->")
    lines.append(f"    <pct_ocupacion_global>{pct_global}</pct_ocupacion_global>")
    lines.append(f"    <pct_ocupacion_media>{pct_media}</pct_ocupacion_media>")
    lines.append(f"    <total_transferencias>{total_transferencias}</total_transferencias>")
    lines.append("  </resumen>")

    # 8. Detalle por almacén
    lines.append("")
    lines.append("  <!-- Detalle de ocupacion por almacen -->")
    lines.append("  <almacenes>")
    for a, pct in zip(almacenes, pct_por_almacen):
        lines.append(f'    <almacen id="{a.id}">')
        lines.append(f"      <capacidad_total>{a.capacidad_total}</capacidad_total>")
        lines.append(f"      <items_almacenados>{a.items_almacenados}</items_almacenados>")
        lines.append(f"      <pct_ocupacion>{pct}</pct_ocupacion>")
        lines.append("    </almacen>")
    lines.append("  </almacenes>")

    # 9. Top 5 items
    lines.append("")
    lines.append("  <!-- Top 5 items con mayor numero de transferencias -->")
    lines.append("  <top5_items_transferidos>")
    for rank, (item_id, cantidad) in enumerate(top5, start=1):
        nombre = item_map.get(item_id, "Desconocido")
        lines.append(f'    <item rank="{rank}">')
        lines.append(f"      <id>{item_id}</id>")
        lines.append(f"      <nombre>{_cdata(nombre)}</nombre>")
        lines.append(f"      <transferencias>{cantidad}</transferencias>")
        lines.append("    </item>")
    lines.append("  </top5_items_transferidos>")

    lines.append("")
    lines.append(f"  <!-- Fin del informe — {now_iso} -->")
    lines.append("</informe>")

    return "\n".join(lines), 200
