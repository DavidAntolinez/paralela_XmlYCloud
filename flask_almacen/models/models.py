from flask_sqlalchemy import SQLAlchemy
from datetime import date

db = SQLAlchemy()


class Usuario(db.Model):
    __tablename__ = "usuario"

    id       = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)

    def to_dict(self):
        return {"id": self.id, "username": self.username}


class Almacen(db.Model):
    __tablename__ = "almacen"

    id                = db.Column(db.Integer, primary_key=True, autoincrement=True)
    capacidad_total   = db.Column(db.Integer, nullable=False)
    items_almacenados = db.Column(db.Integer, nullable=False, default=0)
    usuario_id        = db.Column(db.Integer, db.ForeignKey("usuario.id"), nullable=False)

    def to_dict(self):
        return {
            "id":                self.id,
            "capacidad_total":   self.capacidad_total,
            "items_almacenados": self.items_almacenados,
            "usuario_id":        self.usuario_id,
        }


class Item(db.Model):
    __tablename__ = "item"

    id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre      = db.Column(db.String(120), nullable=False)
    descripcion = db.Column(db.String(255), nullable=False)
    almacen_id  = db.Column(db.Integer, db.ForeignKey("almacen.id"), nullable=False)

    def to_dict(self):
        return {
            "id":          self.id,
            "nombre":      self.nombre,
            "descripcion": self.descripcion,
            "almacen_id":  self.almacen_id,
        }


class HistorialTransferencias(db.Model):
    __tablename__ = "historial"

    id                 = db.Column(db.Integer, primary_key=True, autoincrement=True)
    fecha              = db.Column(db.Date, nullable=False, default=date.today)
    almacen_origen_id  = db.Column(db.Integer, db.ForeignKey("almacen.id"), nullable=False)
    almacen_destino_id = db.Column(db.Integer, db.ForeignKey("almacen.id"), nullable=False)
    item_id            = db.Column(db.Integer, db.ForeignKey("item.id"), nullable=False)
    usuario_id         = db.Column(db.Integer, db.ForeignKey("usuario.id"), nullable=False)

    def to_dict(self):
        return {
            "id":                 self.id,
            "fecha":              str(self.fecha),
            "almacen_origen_id":  self.almacen_origen_id,
            "almacen_destino_id": self.almacen_destino_id,
            "item_id":            self.item_id,
            "usuario_id":         self.usuario_id,
        }
