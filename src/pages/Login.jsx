import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setCargando(true);

    try {
      const resultado = await login(correo, contrasena);

      if (!resultado.success) {
        setError(resultado.message);
        return;
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setError("Ocurrió un error al iniciar sesión.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="simple-auth-page">
      <div className="simple-auth-card">
        {/* BRANDING HEADER */}
        <div className="auth-brand-simple">
          <div className="simple-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <span className="brand-name-text">Secure App</span>
        </div>

        <div className="auth-card-title-group">
          <h1>BIENVENIDO</h1>
          <p>Ingresa tus datos para acceder a tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="simple-form">
          <div className="simple-input-field">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
              placeholder="tu@correo.com"
              autoComplete="email"
              required
              disabled={cargando}
            />
          </div>

          <div className="simple-input-field">
            <label htmlFor="contrasena">Contraseña</label>
            <input
              id="contrasena"
              type="password"
              value={contrasena}
              onChange={(event) => setContrasena(event.target.value)}
              placeholder="Escribe tu contraseña"
              autoComplete="current-password"
              required
              disabled={cargando}
            />
          </div>

          {error && (
            <div className="simple-error-badge">
              <span>⚠ {error}</span>
            </div>
          )}

          <button type="submit" className="simple-submit-btn" disabled={cargando}>
            {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="simple-auth-footer">
          ¿No tienes una cuenta?{" "}
          <Link to="/register">Regístrate en Secure App</Link>
        </p>
      </div>
    </div>
  );
}