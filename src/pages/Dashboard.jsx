import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Dashboard() {
  const { usuario, token, obtenerPerfil, logout } = useAuth();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState(null);
  const [estadisticas, setEstadisticas] = useState({ total: 0, admins: 0, usuariosRegulares: 0 });
  const [usuariosLista, setUsuariosLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [copiado, setCopiado] = useState(false);

  // Estados para Modal de Edición (Admin)
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formNombre, setFormNombre] = useState("");
  const [formCorreo, setFormCorreo] = useState("");
  const [formRol, setFormRol] = useState("usuario");
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  // Cargar datos del dashboard
  async function cargarDatos() {
    const resPerfil = await obtenerPerfil();

    if (!resPerfil.success) {
      setError(resPerfil.message);
      setCargando(false);

      if (
        resPerfil.message &&
        (resPerfil.message.includes("token") || resPerfil.message.includes("Token"))
      ) {
        logout();
        navigate("/login");
      }
      return;
    }

    setPerfil(resPerfil.usuario);

    try {
      const tokenGuardado = localStorage.getItem("token");
      const resStats = await fetch(API_URL + "/api/auth/dashboard-data", {
        headers: {
          Authorization: "Bearer " + tokenGuardado,
        },
      });

      if (resStats.ok) {
        const data = await resStats.json();
        if (data.success) {
          setEstadisticas(data.estadisticas || { total: 0, admins: 0, usuariosRegulares: 0 });
          setUsuariosLista(data.usuarios || []);
          if (data.usuarioActual && data.usuarioActual.rol) {
            setPerfil(function (prev) {
              return Object.assign({}, prev, { rol: data.usuarioActual.rol });
            });
          }
        }
      }
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleCopiarToken() {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopiado(true);
      setTimeout(function () {
        setCopiado(false);
      }, 2000);
    }
  }

  // ABRIR MODAL EDITAR
  function abrirModalEditar(u) {
    setUsuarioEditando(u);
    setFormNombre(u.nombre);
    setFormCorreo(u.correo);
    setFormRol(u.rol || "usuario");
  }

  function cerrarModalEditar() {
    setUsuarioEditando(null);
  }

  // GUARDAR EDICIÓN (ADMIN)
  async function handleGuardarEdicion(e) {
    e.preventDefault();
    if (!usuarioEditando) return;

    setGuardandoEdicion(true);
    setError("");

    try {
      const tokenGuardado = localStorage.getItem("token");
      const respuesta = await fetch(API_URL + "/api/auth/usuarios/" + usuarioEditando.id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + tokenGuardado,
        },
        body: JSON.stringify({
          nombre: formNombre,
          correo: formCorreo,
          rol: formRol,
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        setError(resultado.message || "Error al actualizar usuario.");
        return;
      }

      setMensajeExito("Usuario #" + usuarioEditando.id + " actualizado con éxito.");
      setTimeout(function () {
        setMensajeExito("");
      }, 3500);

      cerrarModalEditar();
      await cargarDatos();
    } catch (err) {
      console.error("Error al editar:", err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setGuardandoEdicion(false);
    }
  }

  // ELIMINAR USUARIO (ADMIN)
  async function handleEliminarUsuario(u) {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar permanentemente a \"" + u.nombre + "\" (" + u.correo + ")?"
    );
    if (!confirmar) return;

    setError("");

    try {
      const tokenGuardado = localStorage.getItem("token");
      const respuesta = await fetch(API_URL + "/api/auth/usuarios/" + u.id, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + tokenGuardado,
        },
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        setError(resultado.message || "Error al eliminar usuario.");
        return;
      }

      setMensajeExito("Usuario #" + u.id + " eliminado de MySQL.");
      setTimeout(function () {
        setMensajeExito("");
      }, 3500);

      await cargarDatos();
    } catch (err) {
      console.error("Error al eliminar:", err);
      setError("No se pudo conectar con el servidor.");
    }
  }

  const nombreUsuario = (perfil && perfil.nombre) || (usuario && usuario.nombre) || "Usuario";
  const correoUsuario = (perfil && perfil.correo) || (usuario && usuario.correo) || "usuario@test.com";
  const rolUsuario = (perfil && perfil.rol) || (usuario && usuario.rol) || "usuario";
  const idUsuarioActual = (perfil && perfil.id) || (usuario && usuario.id) || 1;
  const esAdmin = rolUsuario === "admin";
  const inicial = nombreUsuario.charAt(0).toUpperCase();

  if (cargando) {
    return (
      <div className="dash-loading-screen">
        <div className="dash-spinner"></div>
        <p>Cargando panel de control...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* HEADER NAVEGACIÓN SENCILLO */}
      <header className="app-header">
        <div className="header-wrapper">
          <div className="app-logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <span className="logo-text">Secure App</span>
          </div>

          <nav className="header-nav">
            <a href="#overview" className="nav-link active">Dashboard</a>
            <a href="#usuarios" className="nav-link">Usuarios</a>
            <a href="#token" className="nav-link">Token JWT</a>
          </nav>

          <div className="header-user">
            <div className="user-pill">
              <div className="avatar">{inicial}</div>
              <div className="user-meta">
                <span className="user-name">{nombreUsuario}</span>
                <span className={"user-role role-" + rolUsuario}>{rolUsuario}</span>
              </div>
            </div>

            <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="app-main">
        {mensajeExito && (
          <div className="simple-alert success">
            <span>✔ {mensajeExito}</span>
          </div>
        )}

        {error && (
          <div className="simple-alert error">
            <span>⚠ {error}</span>
          </div>
        )}

        {/* HERO BIENVENIDO */}
        <section id="overview" className="welcome-banner">
          <div className="welcome-content">
            <h1>BIENVENIDO, {nombreUsuario.toUpperCase()}</h1>
            <p>
              {esAdmin
                ? "Panel de administración activo — Tienes permisos para gestionar usuarios en Secure App."
                : "Bienvenido a Secure App. Explora tu panel de control y token de acceso."}
            </p>
          </div>
          <div className="welcome-badge-role">
            <span className={"badge-pill tag-" + rolUsuario}>
              {esAdmin ? "★ Administrador" : "● Usuario"}
            </span>
          </div>
        </section>

        {/* METRICAS SENCILLAS */}
        <section className="stats-row">
          <div className="stat-card">
            <span className="stat-label">Total Usuarios</span>
            <span className="stat-value">{estadisticas.total || usuariosLista.length || 1}</span>
            <span className="stat-sub">En base de datos</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Administradores</span>
            <span className="stat-value">{estadisticas.admins || 1}</span>
            <span className="stat-sub">Permisos avanzados</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Estado de Token</span>
            <span className="stat-value text-indigo">Activo</span>
            <span className="stat-sub">Cifrado JWT</span>
          </div>
        </section>

        {/* TABLA DE USUARIOS SENCILLA */}
        <section id="usuarios" className="content-card">
          <div className="card-header">
            <div>
              <h2>Usuarios Registrados ({usuariosLista.length})</h2>
              <p>Cuentas registradas en el sistema</p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  {esAdmin && <th style={{ textAlign: "center" }}>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {usuariosLista.map((u) => {
                  const uInicial = u.nombre ? u.nombre.charAt(0).toUpperCase() : "U";
                  const esMiPropioUsuario = u.id === idUsuarioActual;

                  return (
                    <tr key={u.id}>
                      <td className="col-id">#{u.id}</td>
                      <td className="col-name">
                        <div className="table-user-row">
                          <div className="mini-avatar">{uInicial}</div>
                          <span>{u.nombre}</span>
                          {esMiPropioUsuario && <span className="you-tag">(Tú)</span>}
                        </div>
                      </td>
                      <td className="col-email">{u.correo}</td>
                      <td>
                        <span className={"role-pill-table role-" + (u.rol || "usuario")}>
                          {u.rol}
                        </span>
                      </td>
                      {esAdmin && (
                        <td className="col-actions">
                          <button
                            type="button"
                            className="btn-tbl btn-edit-sm"
                            onClick={() => abrirModalEditar(u)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className={"btn-tbl btn-delete-sm " + (esMiPropioUsuario ? "disabled" : "")}
                            disabled={esMiPropioUsuario}
                            onClick={() => !esMiPropioUsuario && handleEliminarUsuario(u)}
                          >
                            Eliminar
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* TOKEN VAULT SENCILLO */}
        <section id="token" className="content-card">
          <div className="token-header-box">
            <div>
              <h2>Token JWT de Sesión</h2>
              <p>Clave de acceso generada para tu sesión actual</p>
            </div>
            <button className="copy-btn-primary" onClick={handleCopiarToken}>
              {copiado ? "¡Token Copiado!" : "Copiar Token"}
            </button>
          </div>

          <div className="token-text-box">
            <code>{token || "Cargando token..."}</code>
          </div>
        </section>
      </main>

      {/* MODAL DE EDICIÓN */}
      {usuarioEditando && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Editar Usuario #{usuarioEditando.id}</h3>
              <button type="button" className="close-btn" onClick={cerrarModalEditar}>✕</button>
            </div>

            <form onSubmit={handleGuardarEdicion} className="modal-body">
              <div className="form-field">
                <label htmlFor="edit-nombre">Nombre Completo</label>
                <input
                  id="edit-nombre"
                  type="text"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="edit-correo">Correo Electrónico</label>
                <input
                  id="edit-correo"
                  type="email"
                  value={formCorreo}
                  onChange={(e) => setFormCorreo(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="edit-rol">Rol en el Sistema</label>
                <select
                  id="edit-rol"
                  value={formRol}
                  onChange={(e) => setFormRol(e.target.value)}
                >
                  <option value="usuario">usuario</option>
                  <option value="admin">admin</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={cerrarModalEditar} disabled={guardandoEdicion}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={guardandoEdicion}>
                  {guardandoEdicion ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
