import { useState, useEffect } from 'react'

// Helper para obtener la URL de la API según el entorno
const getApiUrl = (endpoint) => {
  // En producción (Vercel), usar la URL del backend en Render
  // En desarrollo, usar el proxy de Vite
  return import.meta.env.MODE === 'production' 
    ? `https://ferreteria-g9ay.onrender.com${endpoint}`
    : endpoint
}

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    codigoInterno: '',
    codigoBarra: '',
    nombre: '',
    descripcion: '',
    categoriaId: 1,
    marcaId: 1,
    proveedorPrincipalId: 1,
    unidadMedidaId: 1,
    material: '',
    medida: '',
    costoPromedio: 0,
    precioVenta: 0,
    stockActual: 0,
    stockMinimo: 0,
    stockMaximo: 0,
  })

  const [categorias, setCategorias] = useState([])
  const [marcas, setMarcas] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [unidades, setUnidades] = useState([])

  useEffect(() => {
    fetchProductos()
    fetchMaestros()
  }, [])

  const fetchProductos = async () => {
    try {
      const response = await fetch(getApiUrl('/api/productos'))
      const data = await response.json()
      setProductos(data)
    } catch (error) {
      console.error('Error fetching productos:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMaestros = async () => {
    try {
      const [catRes, marRes, provRes, uniRes] = await Promise.all([
        fetch(getApiUrl('/api/categorias')),
        fetch(getApiUrl('/api/marcas')),
        fetch(getApiUrl('/api/proveedores')),
        fetch(getApiUrl('/api/unidades')),
      ])
      setCategorias(await catRes.json())
      setMarcas(await marRes.json())
      setProveedores(await provRes.json())
      setUnidades(await uniRes.json())
    } catch (error) {
      console.error('Error fetching maestros:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(getApiUrl('/api/productos'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowForm(false)
        fetchProductos()
        setFormData({
          codigoInterno: '',
          codigoBarra: '',
          nombre: '',
          descripcion: '',
          categoriaId: 1,
          marcaId: 1,
          proveedorPrincipalId: 1,
          unidadMedidaId: 1,
          material: '',
          medida: '',
          costoPromedio: 0,
          precioVenta: 0,
          stockActual: 0,
          stockMinimo: 0,
          stockMaximo: 0,
        })
      }
    } catch (error) {
      console.error('Error creating producto:', error)
    }
  }

  const filteredProductos = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigoInterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigoBarra?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="loading">Cargando productos...</div>

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Productos</h2>
          <button className="success" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : '+ Nuevo Producto'}
          </button>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por nombre, código interno o código de barras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '15px' }}>Nuevo Producto</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Código Interno *</label>
                <input
                  required
                  value={formData.codigoInterno}
                  onChange={(e) => setFormData({ ...formData, codigoInterno: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Código de Barras</label>
                <input
                  value={formData.codigoBarra}
                  onChange={(e) => setFormData({ ...formData, codigoBarra: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Nombre *</label>
              <input
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <input
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Categoría</label>
                <select
                  value={formData.categoriaId}
                  onChange={(e) => setFormData({ ...formData, categoriaId: parseInt(e.target.value) })}
                >
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Marca</label>
                <select
                  value={formData.marcaId}
                  onChange={(e) => setFormData({ ...formData, marcaId: parseInt(e.target.value) })}
                >
                  {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Unidad</label>
                <select
                  value={formData.unidadMedidaId}
                  onChange={(e) => setFormData({ ...formData, unidadMedidaId: parseInt(e.target.value) })}
                >
                  {unidades.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Material</label>
                <input
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Medida</label>
                <input
                  value={formData.medida}
                  onChange={(e) => setFormData({ ...formData, medida: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Costo Promedio</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.costoPromedio}
                  onChange={(e) => setFormData({ ...formData, costoPromedio: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="form-group">
                <label>Precio Venta</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.precioVenta}
                  onChange={(e) => setFormData({ ...formData, precioVenta: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Stock Actual</label>
                <input
                  type="number"
                  value={formData.stockActual}
                  onChange={(e) => setFormData({ ...formData, stockActual: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="form-group">
                <label>Stock Mínimo</label>
                <input
                  type="number"
                  value={formData.stockMinimo}
                  onChange={(e) => setFormData({ ...formData, stockMinimo: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="form-group">
                <label>Stock Máximo</label>
                <input
                  type="number"
                  value={formData.stockMaximo}
                  onChange={(e) => setFormData({ ...formData, stockMaximo: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <button type="submit" className="primary">Guardar Producto</button>
          </form>
        )}
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Marca</th>
              <th>Unidad</th>
              <th>Stock</th>
              <th>Precio</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredProductos.map(producto => (
              <tr key={producto.id}>
                <td>{producto.codigoInterno}</td>
                <td>{producto.nombre}</td>
                <td>{producto.categoria?.nombre}</td>
                <td>{producto.marca?.nombre}</td>
                <td>{producto.unidadMedida?.abreviatura}</td>
                <td>
                  <span className={`badge ${producto.stockActual <= producto.stockMinimo ? 'danger' : 'success'}`}>
                    {producto.stockActual}
                  </span>
                </td>
                <td>${producto.precioVenta.toFixed(2)}</td>
                <td>
                  <span className={`badge ${producto.activo ? 'success' : 'warning'}`}>
                    {producto.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
