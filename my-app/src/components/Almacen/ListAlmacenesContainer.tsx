import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAlmacenes } from "../../helpers/API";
import AlmacenCard from "./AlmacenCard";
import type { Almacen } from "../../types";

export default function ListAlmacenesContainer() {
  const { token = "" } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAlmacenes(token)
      .then((res) => setAlmacenes(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          Mis <span>Almacenes</span>
        </h1>
        <button className="btn btn-primary" onClick={() => navigate(`/newalmacen/${token}`)}>
          + Nuevo
        </button>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : almacenes.length === 0 ? (
        <div className="empty">No tienes almacenes aún. ¡Crea uno!</div>
      ) : (
        <div className="card-grid">
          {almacenes.map((alm) => (
            <AlmacenCard almacen={alm} token={token} key={alm.id} />
          ))}
        </div>
      )}
    </div>
  );
}
