import { useState, useEffect } from 'react'

// Helper para obtener la URL de la API según el entorno
const getApiUrl = (endpoint) => {
  // En producción (Vercel), usar la URL del backend en Render
  // En desarrollo, usar el proxy de Vite
  return import.meta.env.MODE === 'production' 
    ? `https://ferreteria-g9ay.onrender.com${endpoint}`
    : endpoint
}

export default function Ventas() {
  const [productos, setProductos] = useState([])
  const [carrito, setCarrito] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [clienteNombre, setClienteNombre] = useState('')
  const [clienteIdentificacion, setClienteIdentificacion] = useState('')
  const [metodoPago, setMetodoPago] = useState('EFECTIVO')
  const [loading, setLoading] = useState(false)
  const [ventaExitosa, setVentaExitosa] = useState(null)

  useEffect(() => {
    fetchProductos()
  }, [])

  const fetchProductos = async () => {
    try {
      const response = await fetch(getApiUrl('/api/productos'))
      const data = await response.json()
      setProductos(data.filter(p => p.activo && p.stockActual > 0))
    } catch (error) {
      console.error('Error fetching productos:', error)
    }
  }

  const filteredProductos = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigoInterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigoBarra?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const agregarAlCarrito = (producto) => {
    const existing = carrito.find(item => item.productoId === producto.id)
    
    if (existing) {
      if (existing.cantidad + 1 > producto.stockActual) {
        alert('No hay suficiente stock')
        return
      }
      setCarrito(carrito.map(item =>
        item.productoId === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ))
    } else {
      setCarrito([...carrito, {
        productoId: producto.id,
        nombre: producto.nombre,
        precioUnitario: producto.precioVenta,
        cantidad: 1,
        stockDisponible: producto.stockActual,
      }])
    }
  }

  const actualizarCantidad = (productoId, nuevaCantidad) => {
    const item = carrito.find(i => i.productoId === productoId)
    if (nuevaCantidad > item.stockDisponible) {
      alert('No hay suficiente stock')
      return
    }
    if (nuevaCantidad <= 0) {
      setCarrito(carrito.filter(i => i.productoId !== productoId))
    } else {
      setCarrito(carrito.map(i =>
        i.productoId === productoId ? { ...i, cantidad: nuevaCantidad } : i
      ))
    }
  }

  const eliminarDelCarrito = (productoId) => {
    setCarrito(carrito.filter(i => i.productoId !== productoId))
  }

  const subtotal = carrito.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0)
  const impuesto = subtotal * 0.18
  const total = subtotal + impuesto

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (carrito.length === 0) {
      alert('El carrito está vacío')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(getApiUrl('/api/ventas'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sucursalId: 1,
          clienteNombre,
          clienteIdentificacion,
          items: carrito.map(item => ({
            productoId: item.productoId,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
          })),
          subtotal,
          impuesto,
          descuento: 0,
          total,
          metodoPago,
          usuarioId: 1,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setVentaExitosa(data)
        setCarrito([])
        setClienteNombre('')
        setClienteIdentificacion('')
        fetchProductos()
      } else {
        alert(data.error || 'Error al procesar la venta')
      }
    } catch (error) {
      alert('Error al procesar la venta')
    } finally {
      setLoading(false)
    }
  }

  if (ventaExitosa) {
    return (
      <div className="card">
        <h2 style={{ color: '#27ae60' }}>✅ Venta Exitosa</h2>
        <p><strong>Número de Venta:</strong> {ventaExitosa.numeroVenta}</p>
        <p><strong>Total:</strong> ${total.toFixed(2)}</p>
        <button className="primary" onClick={() => setVentaExitosa(null)}>
          Nueva Venta
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="form-row">
        <div className="card" style={{ flex: 2 }}>
          <h2>Productos</h2>
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {filteredProductos.map(producto => (
              <div
                key={producto.id}
                style={{
                  padding: '15px',
                  borderBottom: '1px solid #ddd',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onClick={() => agregarAlCarrito(producto)}
              >
                <div>
                  <strong>{producto.nombre}</strong>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {producto.codigoInterno} | {producto.categoria?.nombre}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold' }}>${producto.precioVenta.toFixed(2)}</div>
                  <div style={{ fontSize: '12px', color: producto.stockActual <= producto.stockMinimo ? '#e74c3c' : '#27ae60' }}>
                    Stock: {producto.stockActual}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <h2>Carrito</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Cliente (opcional)</label>
              <input
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                placeholder="Nombre del cliente"
              />
            </div>
            
            <div className="form-group">
              <label>Identificación (opcional)</label>
              <input
                value={clienteIdentificacion}
                onChange={(e) => setClienteIdentificacion(e.target.value)}
                placeholder="DNI/RUC"
              />
            </div>
            
            <div className="form-group">
              <label>Método de Pago</label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="CREDITO">Crédito</option>
              </select>
            </div>

            <div style={{ margin: '20px 0', minHeight: '200px' }}>
              {carrito.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999' }}>Carrito vacío</p>
              ) : (
                carrito.map(item => (
                  <div
                    key={item.productoId}
                    style={{
                      padding: '10px',
                      borderBottom: '1px solid #eee',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px' }}>{item.nombre}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        ${item.precioUnitario.toFixed(2)} c/u
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <button
                        type="button"
                        onClick={() => actualizarCantidad(item.productoId, item.cantidad - 1)}
                        style={{ padding: '2px 8px' }}
                      >
                        -
                      </button>
                      <span style={{ minWidth: '30px', textAlign: 'center' }}>{item.cantidad}</span>
                      <button
                        type="button"
                        onClick={() => actualizarCantidad(item.productoId, item.cantidad + 1)}
                        style={{ padding: '2px 8px' }}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => eliminarDelCarrito(item.productoId)}
                        style={{ padding: '2px 8px', marginLeft: '5px' }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ borderTop: '2px solid #ddd', paddingTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>IVA (18%):</span>
                <span>${impuesto.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="success"
              style={{ width: '100%', marginTop: '15px', padding: '15px', fontSize: '16px' }}
              disabled={loading || carrito.length === 0}
            >
              {loading ? 'Procesando...' : 'Completar Venta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
