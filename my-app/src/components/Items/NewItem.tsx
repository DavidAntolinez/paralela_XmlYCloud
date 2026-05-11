import { useState, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { putItem } from "../../helpers/API";

export default function NewItem() {
  const { almcId = "", token = "" } = useParams<{ almcId: string; token: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await putItem(token, almcId, form.nombre, form.descripcion);
      navigate(`/items/${almcId}/${token}/false`);
    } catch {
      setError("Error al guardar el item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-box">
        <h1 className="form-heading">Nuevo Item</h1>
        <p className="form-sub">Almacén #{almcId}</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              className="form-input"
              placeholder="Nombre del item"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Descripción del item"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              required
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Guardando..." : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
