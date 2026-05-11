import { useState, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { putAlmacenes } from "../../helpers/API";

export default function NewAlmacen() {
  const { token = "" } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [tamaño, setTamaño] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!tamaño || Number(tamaño) < 1) {
      setError("El tamaño debe ser un número mayor a 0");
      return;
    }
    setLoading(true);
    try {
      await putAlmacenes(token, tamaño);
      navigate(`/almacenes/${token}`);
    } catch {
      setError("Error al crear el almacén");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-box">
        <h1 className="form-heading">Nuevo Almacén</h1>
        <p className="form-sub">Define la capacidad del nuevo almacén</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              className="form-input"
              type="number"
              min={1}
              placeholder="Capacidad (ej. 10)"
              value={tamaño}
              onChange={(e) => setTamaño(e.target.value)}
              required
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
