import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getHistorial } from "../../helpers/API";
import type { HistorialTransferencia } from "../../types";

export default function ListHistorialContainer() {
  const { token = "" } = useParams<{ token: string }>();
  const [historial, setHistorial] = useState<HistorialTransferencia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistorial(token)
      .then((res) => setHistorial(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="page">
      <h1 className="page-title">
        Historial de <span>Transferencias</span>
      </h1>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : historial.length === 0 ? (
        <div className="empty">No hay transferencias registradas.</div>
      ) : (
        <table className="hst-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Origen</th>
              <th>Destino</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((h) => (
              <tr key={h.id}>
                <td>{h.id}</td>
                <td>#{h.item_id}</td>
                <td>#{h.almacen_origen_id}</td>
                <td>#{h.almacen_destino_id}</td>
                <td>{h.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
