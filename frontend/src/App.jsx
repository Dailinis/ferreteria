import { useState } from 'react'
import Productos from './components/Productos'
import Ventas from './components/Ventas'
import Inventario from './components/Inventario'
import Login from './components/Login'

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: '250px',
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0
      }}>
        <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 style={{ fontSize: '20px', marginBottom: '5px' }}>🔧 Inventario</h1>
          <p style={{ fontSize: '12px', color: '#bdc3c7' }}>Ferretería</p>
        </div>
        
        <nav style={{ flex: 1 }}>
          <button
            onClick={() => setCurrentView('dashboard')}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '12px 15px',
              marginBottom: '5px',
              backgroundColor: currentView === 'dashboard' ? '#3498db' : 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setCurrentView('productos')}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '12px 15px',
              marginBottom: '5px',
              backgroundColor: currentView === 'productos' ? '#3498db' : 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            📦 Productos
          </button>
          <button
            onClick={() => setCurrentView('ventas')}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '12px 15px',
              marginBottom: '5px',
              backgroundColor: currentView === 'ventas' ? '#3498db' : 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            💰 Ventas
          </button>
          <button
            onClick={() => setCurrentView('inventario')}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '12px 15px',
              marginBottom: '5px',
              backgroundColor: currentView === 'inventario' ? '#3498db' : 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            📋 Inventario
          </button>
        </nav>
        
        <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ fontSize: '12px', color: '#bdc3c7', marginBottom: '10px' }}>
            {user?.nombreCompleto}
          </p>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#e74c3c',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            Salir
          </button>
        </div>
      </aside>

      <main style={{ marginLeft: '250px', flex: 1, padding: '30px', backgroundColor: '#f5f5f5' }}>
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
    valorInventario: 0
  })

  return (
    <div>
      <div className="card">
        <h2>Bienvenido, {user?.nombreCompleto}</h2>
        <p style={{ color: '#666' }}>Rol: {user?.rol}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Productos</h3>
          <div className="value">{stats.totalProductos}</div>
        </div>
        <div className="stat-card">
          <h3>Stock Bajo</h3>
          <div className="value" style={{ color: '#e74c3c' }}>{stats.stockBajo}</div>
        </div>
        <div className="stat-card">
          <h3>Ventas Hoy</h3>
          <div className="value" style={{ color: '#27ae60' }}>{stats.ventasHoy}</div>
        </div>
        <div className="stat-card">
          <h3>Valor Inventario</h3>
          <div className="value">${stats.valorInventario.toFixed(2)}</div>
        </div>
      </div>

      <div className="card">
        <h2>Acciones Rápidas</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="primary" onClick={() => setCurrentView('ventas')}>
            Nueva Venta
          </button>
          <button className="success" onClick={() => setCurrentView('productos')}>
            Agregar Producto
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
