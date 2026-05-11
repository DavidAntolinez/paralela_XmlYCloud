import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAlmacenes, newHistorial } from "../../helpers/API";
import type { Almacen } from "../../types";

export default function Transferencia() {
  const { token = "", almacenId = "", id = "" } = useParams<{
    token: string;
    almacenId: string;
    id: string;
  }>();
  const navigate = useNavigate();
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState<number | null>(null);

  useEffect(() => {
    getAlmacenes(token)
      .then((res) => {
        // Regla de negocio: excluir almacén origen y los que estén llenos
        const disponibles = res.data.filter(
          (a) =>
            a.id !== Number(almacenId) &&
            a.items_almacenados < a.capacidad_total
        );
        setAlmacenes(disponibles);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, almacenId]);

  const handleTransfer = async (destId: number) => {
    setTransferring(destId);
    try {
      await newHistorial(token, id, almacenId, destId);
      navigate(`/almacenes/${token}`);
    } catch {
      alert("Ha ocurrido un error al transferir");
    } finally {
      setTransferring(null);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">
        Transferir <span>Item #{id}</span>
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        Selecciona el almacén destino. Solo se muestran almacenes con espacio disponible.
      </p>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : almacenes.length === 0 ? (
        <div className="empty">No hay almacenes disponibles para la transferencia.</div>
      ) : (
        <div className="transfer-list">
          {almacenes.map((alm) => {
            const fillPct = (alm.items_almacenados / alm.capacidad_total) * 100;
            return (
              <div className="transfer-row" key={alm.id}>
                <div className="transfer-row-info">
                  <div>Almacén <strong>#{alm.id}</strong></div>
                  <div className="transfer-row-sub">
                    {alm.items_almacenados}/{alm.capacidad_total} items · {Math.round(100 - fillPct)}% libre
                  </div>
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleTransfer(alm.id)}
                  disabled={transferring !== null}
                >
                  {transferring === alm.id ? "Transfiriendo..." : "Transferir →"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
