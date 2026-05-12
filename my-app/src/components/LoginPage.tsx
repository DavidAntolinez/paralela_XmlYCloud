import { useState } from "react";
import type { FormEvent } from "react";
import { login, signUp } from "../helpers/API";
import axios from "axios";

interface Props {
  setToken: (token: string) => void;
}

export default function LoginPage({ setToken }: Props) {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await signUp(credentials.username, credentials.password);
        alert("Registro exitoso. Ahora inicia sesión.");
        setIsRegister(false);
      } else {
        const response = await login(credentials.username, credentials.password);
        setToken(response.data.token);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400) {
          setError(isRegister ? (err.response?.data ?? "Error al registrar") : "Credenciales incorrectas");
        } else {
          setError("Ha ocurrido un error inesperado");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-box">
        <h1 className="form-heading">{isRegister ? "Crear cuenta" : "Iniciar sesión"}</h1>
        <p className="form-sub">
          {isRegister ? "Completa los datos para registrarte" : "Ingresa tus credenciales"}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              className="form-input"
              placeholder="Usuario"
              autoComplete="username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
            />
            <input
              className="form-input"
              type="password"
              placeholder="Contraseña"
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }} disabled={loading}>
            {loading ? "..." : isRegister ? "Registrarse" : "Entrar"}
          </button>
        </form>

        <div className="form-switch">
          {isRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
          <button onClick={() => { setIsRegister(!isRegister); setError(null); }}>
            {isRegister ? "Inicia sesión" : "Regístrate"}
          </button>
        </div>
      </div>
    </div>
  );
}
