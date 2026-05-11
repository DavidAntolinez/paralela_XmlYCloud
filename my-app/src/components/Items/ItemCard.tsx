import { Link } from "react-router-dom";
import type { Item } from "../../types";

interface Props {
  item: Item;
  token: string;
}

export default function ItemCard({ item, token }: Props) {
  return (
    <div className="card">
      <p className="card-id">ID #{item.id}</p>
      <h4 className="card-title">{item.nombre}</h4>
      <p className="card-meta">{item.descripcion}</p>
      <Link
        to={`/historial/${item.almacen_id}/${token}/${item.id}`}
        className="card-link"
      >
        Transferir →
      </Link>
    </div>
  );
}
