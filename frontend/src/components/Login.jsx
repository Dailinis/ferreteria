import { useState } from 'react'
import backgroundImage from '/images/como-poner-una-ferreteria-guia.jpg'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // En producción, usar localhost:3001 directamente
      const apiUrl = import.meta.env.MODE === 'production' 
        ? 'http://localhost:3001/api/auth/login'
        : '/api/auth/login'
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión')
      }

      localStorage.setItem('token', data.token)
      onLogin(data.usuario)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: `linear-gradient(rgba(44, 62, 80, 0.4), rgba(44, 62, 80, 0.4)), url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      padding: '20px'
    }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <h1 style={{ fontSize: '24px', color: '#2c3e50', marginBottom: '3px' }}>🔧</h1>
          <h2 style={{ color: '#2c3e50', marginBottom: '2px', fontSize: '18px', fontWeight: 'bold' }}>Sistema de Inventario</h2>
          <p style={{ color: '#2c3e50', fontSize: '12px', fontWeight: 'bold' }}>Ferretería</p>
        </div>
        
        {error && <div className="alert error" style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '15px',
          border: '1px solid #f5c6cb'
        }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              style={{ padding: '8px' }}
            />
          </div>
          
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
              required
              style={{ padding: '8px' }}
            />
          </div>
          
          <button 
            type="submit" 
            className="primary" 
            style={{ 
              width: '100%', 
              padding: '8px',
              fontSize: '14px',
              fontWeight: 'bold'
            }} 
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Ingresar'}
          </button>
        </form>
        
        <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
          <p style={{ margin: '0', fontSize: '10px', color: '#666', textAlign: 'center' }}>
            <strong>Credenciales de demo:</strong><br />
            Usuario: admin / Contraseña: admin123
          </p>
        </div>
      </div>
    </div>
  )
}
