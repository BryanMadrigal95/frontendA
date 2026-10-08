import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmacion, setConfirmacion] = useState("");

  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setExito(false);

    if (nombre.trim() === "") {
      setError("Debes escribir tu nombre.");
      return;
    }

    if (correo.trim() === "") {
      setError("Debes escribir tu correo.");
      return;
    }

    if (contrasena.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (contrasena !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const resultado = await register({
      nombre: nombre,
      correo: correo,
      contrasena: contrasena,
    });

    if (!resultado.success) {
      setError(resultado.message);
      return;
    }

    setExito(true);
    setNombre("");
    setCorreo("");
    setContrasena("");
    setConfirmacion("");
  }

  if (exito) {
    return (
      <div className="simple-auth-page">
        <div className="simple-auth-card">
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
            <h1>¡REGISTRO EXITOSO!</h1>
            <p>Tu cuenta ha sido creada en Secure App</p>
          </div>

          <button type="button" className="simple-submit-btn" onClick={() => navigate("/login")}>
            Ir a Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="simple-auth-page">
      <div className="simple-auth-card">
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
          <h1>CREAR CUENTA</h1>
          <p>Regístrate para acceder a Secure App</p>
        </div>

        <form onSubmit={handleSubmit} className="simple-form">
          <div className="simple-input-field">
            <label htmlFor="nombre">Nombre completo</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="Tu nombre completo"
              required
            />
          </div>

          <div className="simple-input-field">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
              placeholder="tu@correo.com"
              required
            />
          </div>

          <div className="simple-input-field">
            <label htmlFor="contrasena">Contraseña</label>
            <input
              id="contrasena"
              type="password"
              value={contrasena}
              onChange={(event) => setContrasena(event.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
            />
          </div>

          <div className="simple-input-field">
            <label htmlFor="confirmacion">Confirmar contraseña</label>
            <input
              id="confirmacion"
              type="password"
              value={confirmacion}
              onChange={(event) => setConfirmacion(event.target.value)}
              placeholder="Repite tu contraseña"
              required
            />
          </div>

          {error && (
            <div className="simple-error-badge">
              <span>⚠ {error}</span>
            </div>
          )}

          <button type="submit" className="simple-submit-btn">
            Crear cuenta
          </button>
        </form>

        <p className="simple-auth-footer">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login">Inicia sesión en Secure App</Link>
        </p>
      </div>
    </div>
  );
}