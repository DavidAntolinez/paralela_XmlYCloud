import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getItems } from "../../helpers/API";
import ItemCard from "./ItemCard";
import type { Item } from "../../types";

export default function ListItemsContainer() {
  const { token = "", id = "", isFull } = useParams<{ token: string; id: string; isFull: string }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getItems(token, id)
      .then((res) => setItems(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, id]);

  const canAdd = isFull === "false";

  return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          Items <span>#{id}</span>
        </h1>
        {canAdd && (
          <button className="btn btn-primary" onClick={() => navigate(`/newitem/${id}/${token}`)}>
            + Agregar Item
          </button>
        )}
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : items.length === 0 ? (
        <div className="empty">Este almacén está vacío.</div>
      ) : (
        <div className="card-grid">
          {items.map((item) => (
            <ItemCard item={item} token={token} key={item.id} />
          ))}
        </div>
      )}
    </div>
  );
}
