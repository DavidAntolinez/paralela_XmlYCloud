import { Link } from "react-router-dom";
import type { Almacen } from "../../types";

interface Props {
  almacen: Almacen;
  token: string;
}

export default function AlmacenCard({ almacen, token }: Props) {
  const isFull = almacen.items_almacenados >= almacen.capacidad_total;
  const fillPct = almacen.capacidad_total > 0
    ? (almacen.items_almacenados / almacen.capacidad_total) * 100
    : 0;

  return (
    <div className="card">
      <p className="card-id">ID #{almacen.id}</p>
      <h4 className="card-title">Almacén</h4>
      <p className="card-meta">Capacidad: {almacen.capacidad_total}</p>
      <p className="card-meta">
        Items: {almacen.items_almacenados} / {almacen.capacidad_total}
      </p>
      <div className="capacity-bar">
        <div
          className={`capacity-bar-fill${isFull ? " full" : ""}`}
          style={{ width: `${fillPct}%` }}
        />
      </div>
      <Link
        to={`/items/${almacen.id}/${token}/${isFull}`}
        className="card-link"
      >
        Ver items →
      </Link>
    </div>
  );
}
