import { useState, useEffect } from 'react'

// Helper para obtener la URL de la API según el entorno
const getApiUrl = (endpoint) => {
  // En producción (Vercel), usar la URL del backend en Render
  // En desarrollo, usar el proxy de Vite
  return import.meta.env.MODE === 'production' 
    ? `https://ferreteria-g9ay.onrender.com${endpoint}`
    : endpoint
}

export default function Inventario() {
  const [stock, setStock] = useState([])
  const [alertas, setAlertas] = useState([])
  const [movimientos, setMovimientos] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('stock')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [stockRes, alertasRes, movRes] = await Promise.all([
        fetch(getApiUrl('/api/inventario/stock')),
        fetch(getApiUrl('/api/inventario/alertas')),
        fetch(getApiUrl('/api/inventario/movimientos')),
      ])
      setStock(await stockRes.json())
      setAlertas(await alertasRes.json())
      setMovimientos(await movRes.json())
    } catch (error) {
      console.error('Error fetching inventario:', error)
    } finally {
      setLoading(false)
    }
  }

  const marcarAlertaLeida = async (id) => {
    try {
      await fetch(getApiUrl(`/api/inventario/alertas/${id}/leer`), { method: 'PUT' })
      setAlertas(alertas.filter(a => a.id !== id))
    } catch (error) {
      console.error('Error marcando alerta:', error)
    }
  }

  if (loading) return <div className="loading">Cargando inventario...</div>

  return (
    <div>
      <div className="card">
        <div style={{ marginBottom: '20px' }}>
          <button
            className={activeTab === 'stock' ? 'primary' : ''}
            onClick={() => setActiveTab('stock')}
            style={{ marginRight: '10px' }}
          >
            Stock Actual
          </button>
          <button
            className={activeTab === 'alertas' ? 'primary' : ''}
            onClick={() => setActiveTab('alertas')}
            style={{ marginRight: '10px' }}
          >
            Alertas ({alertas.length})
          </button>
          <button
            className={activeTab === 'movimientos' ? 'primary' : ''}
            onClick={() => setActiveTab('movimientos')}
          >
            Movimientos
          </button>
        </div>

        {activeTab === 'stock' && (
          <div>
            <h3>Stock por Sucursal</h3>
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Sucursal</th>
                  <th>Cantidad</th>
                  <th>Stock Mínimo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {stock.map(s => (
                  <tr key={s.id}>
                    <td>{s.producto?.nombre}</td>
                    <td>{s.producto?.categoria?.nombre}</td>
                    <td>{s.sucursal?.nombre}</td>
                    <td>{s.cantidad}</td>
                    <td>{s.stockMinimo}</td>
                    <td>
                      <span className={`badge ${s.cantidad <= s.stockMinimo ? 'danger' : 'success'}`}>
                        {s.cantidad <= s.stockMinimo ? 'Bajo' : 'OK'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'alertas' && (
          <div>
            <h3>Alertas de Stock</h3>
            {alertas.length === 0 ? (
              <p style={{ color: '#666' }}>No hay alertas pendientes</p>
            ) : (
              alertas.map(alerta => (
                <div
                  key={alerta.id}
                  className={`alert ${alerta.tipoAlerta === 'SIN_STOCK' ? 'error' : 'warning'}`}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <strong>{alerta.producto?.nombre}</strong>
                    <p>{alerta.mensaje}</p>
                    <small>{new Date(alerta.fechaGenerada).toLocaleString()}</small>
                  </div>
                  <button onClick={() => marcarAlertaLeida(alerta.id)}>Marcar como leída</button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'movimientos' && (
          <div>
            <h3>Historial de Movimientos</h3>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Stock Anterior</th>
                  <th>Stock Nuevo</th>
                  <th>Usuario</th>
                  <th>Referencia</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map(m => (
                  <tr key={m.id}>
                    <td>{new Date(m.fecha).toLocaleString()}</td>
                    <td>{m.producto?.nombre}</td>
                    <td>
                      <span className={`badge ${m.tipoMovimiento?.afectaStock === 'ENTRADA' ? 'success' : 'warning'}`}>
                        {m.tipoMovimiento?.nombre}
                      </span>
                    </td>
                    <td>{m.cantidad}</td>
                    <td>{m.stockAnterior}</td>
                    <td>{m.stockNuevo}</td>
                    <td>{m.usuario?.nombreCompleto}</td>
                    <td>{m.referencia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
