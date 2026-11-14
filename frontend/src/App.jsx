import { useState, useEffect } from 'react'
import Productos from './components/Productos'
import Ventas from './components/Ventas'
import Inventario from './components/Inventario'
import Login from './components/Login'

const getApiUrl = (endpoint) =>
  import.meta.env.MODE === 'production'
    ? `https://ferreteria-g9ay.onrender.com${endpoint}`
    : endpoint

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'productos', label: 'Productos', icon: 'box' },
  { id: 'ventas', label: 'Ventas', icon: 'cart' },
  { id: 'inventario', label: 'Inventario', icon: 'clipboard' },
]

const ICONS = {
  wrench: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />,
  dashboard: <><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></>,
  box: <><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" /><path d="M3.3 8.3L12 13l8.7-4.7" /><path d="M12 13v9" /></>,
  cart: <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></>,
  clipboard: <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M9 12h6M9 16h6" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>,
  alert: <><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>,
  dollar: <><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  arrow: <><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
}

function Icon({ name }) {
  return (
    <svg
      className="sidebar-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  )
}

function App() {
  const [currentView, setCurrentView] = useState('login')
  const [user, setUser] = useState(null)

  const handleLogin = (userData) => {
    setUser(userData)
    setCurrentView('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentView('login')
  }

  if (currentView === 'login') {
    return <Login onLogin={handleLogin} />
  }

  const initials = (user?.nombreCompleto || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Icon name="wrench" />
          </div>
          <div>
            <h1>Inventario</h1>
            <p>Ferretería</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section">Menú principal</span>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`sidebar-link${currentView === item.id ? ' active' : ''}`}
              onClick={() => setCurrentView(item.id)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <strong>{user?.nombreCompleto}</strong>
              <span>{user?.rol}</span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Cerrar sesión">
            <Icon name="logout" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main className="app-main">
        {currentView === 'dashboard' && <Dashboard user={user} setCurrentView={setCurrentView} />}
        {currentView === 'productos' && <Productos />}
        {currentView === 'ventas' && <Ventas />}
        {currentView === 'inventario' && <Inventario />}
      </main>
    </div>
  )
}

function Dashboard({ user, setCurrentView }) {
  const [stats, setStats] = useState({
    totalProductos: 0,
    stockBajo: 0,
    ventasHoy: 0,
    montoVentasHoy: 0,
    valorInventario: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch(getApiUrl('/api/dashboard/stats'))
      .then((r) => r.json())
      .then((data) => !cancelled && setStats(data))
      .catch((err) => console.error('Error fetching stats:', err))
      .finally(() => !cancelled && setLoadingStats(false))
    return () => { cancelled = true }
  }, [])

  const formatMoney = (n) =>
    n.toLocaleString('es-ES', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })

  const firstName = user?.nombreCompleto?.split(' ')[0] || ''
  const hayAlertas = stats.stockBajo > 0
  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const kpis = [
    {
      label: 'Total Productos',
      value: stats.totalProductos,
      icon: 'box',
      tone: 'indigo',
      hint: 'Productos registrados',
    },
    {
      label: 'Stock Bajo',
      value: stats.stockBajo,
      icon: 'alert',
      tone: hayAlertas ? 'rose' : 'neutral',
      valueClass: hayAlertas ? 'danger' : '',
      hint: hayAlertas ? 'Requieren reposición' : 'Sin alertas activas',
      hintClass: hayAlertas ? 'alert' : '',
    },
    {
      label: 'Ventas Hoy',
      value: stats.ventasHoy,
      icon: 'cart',
      tone: 'emerald',
      valueClass: stats.ventasHoy > 0 ? 'success' : '',
      hint: stats.ventasHoy > 0 ? `${formatMoney(stats.montoVentasHoy)} facturados hoy` : 'Sin ventas registradas hoy',
    },
    {
      label: 'Valor Inventario',
      value: formatMoney(stats.valorInventario),
      icon: 'dollar',
      tone: 'neutral',
      hint: 'Valorización a costo',
    },
  ]

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">
            <span className="dot" />
            <span style={{ textTransform: 'capitalize' }}>{today}</span>
          </span>
          <h1>Hola, <span className="accent">{firstName}</span></h1>
          <p>Aquí tienes un resumen del estado de tu inventario.</p>
        </div>
        <span className="role-chip">
          <Icon name="shield" />
          {user?.rol}
        </span>
      </header>

      <section className="stats-grid">
        {kpis.map((k) => (
          <article key={k.label} className="stat-card">
            <div className="stat-card-top">
              <h3>{k.label}</h3>
              <span className={`stat-icon ${k.tone}`}>
                <Icon name={k.icon} />
              </span>
            </div>
            <div className={`value ${k.valueClass || ''}${loadingStats ? ' skeleton' : ''}`}>
              {loadingStats ? '—' : k.value}
            </div>
            <span className={`hint ${k.hintClass || ''}`}>{k.hint}</span>
          </article>
        ))}
      </section>

      <section className="card">
        <div className="quick-actions-header">
          <div>
            <h2>Acciones rápidas</h2>
            <p>Atajos a las operaciones más frecuentes.</p>
          </div>
        </div>
        <div className="quick-actions">
          <button className="action-btn primary" onClick={() => setCurrentView('ventas')}>
            <span className="action-icon">
              <Icon name="cart" />
            </span>
            <span className="action-text">
              <strong>Nueva venta</strong>
              <span>Registrar una venta y descontar stock</span>
            </span>
            <span className="action-arrow">
              <Icon name="arrow" />
            </span>
          </button>
          <button className="action-btn secondary" onClick={() => setCurrentView('productos')}>
            <span className="action-icon">
              <Icon name="plus" />
            </span>
            <span className="action-text">
              <strong>Agregar producto</strong>
              <span>Dar de alta un nuevo artículo</span>
            </span>
            <span className="action-arrow">
              <Icon name="arrow" />
            </span>
          </button>
        </div>
      </section>
    </div>
  )
}

export default App
