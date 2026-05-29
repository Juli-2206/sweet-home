const supabase = require('../../config/supabase');

async function listar({ categoria, nombre }) {
  let query = supabase
    .from('productos')
    .select('id, nombre, descripcion, precio, imagen_url, imagenes, imagenes_titulos, stock, categorias(id, nombre)')
    .eq('activo', true)
    .order('nombre');

  if (categoria) query = query.eq('categoria_id', categoria);
  if (nombre)    query = query.ilike('nombre', `%${nombre}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function todos({ categoria, nombre, activo }) {
  let query = supabase
    .from('productos')
    .select('*, categorias(id, nombre)')
    .order('nombre');

  if (categoria)            query = query.eq('categoria_id', categoria);
  if (nombre)               query = query.ilike('nombre', `%${nombre}%`);
  if (activo !== undefined) query = query.eq('activo', activo === 'true');

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function detalle(id) {
  const { data, error } = await supabase
    .from('productos')
    .select('*, categorias(id, nombre)')
    .eq('id', id)
    .eq('activo', true)
    .single();
  if (error) throw error;
  return data;
}

async function crear(payload) {
  const { data, error } = await supabase
    .from('productos').insert(payload).select().single();
  if (error) throw error;
  return data;
}

async function editar(id, payload) {
  const { data, error } = await supabase
    .from('productos').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

async function toggle(id) {
  const { data: actual } = await supabase
    .from('productos').select('activo').eq('id', id).single();
  const { data, error } = await supabase
    .from('productos').update({ activo: !actual.activo }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

async function uploadImagen(file) {
  const ext  = file.originalname.split('.').pop().toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from('productos')
    .upload(path, file.buffer, { contentType: file.mimetype, upsert: false });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('productos')
    .getPublicUrl(path);

  return publicUrl;
}

// ===== ELIMINAR (hard delete) =====
async function eliminar(id) {
  const { error } = await supabase.from('productos').delete().eq('id', id);
  if (error) throw error;
  return { mensaje: 'Producto eliminado permanentemente' };
}

// ===== COLORES =====
async function listarColores(productoId) {
  const { data, error } = await supabase
    .from('colores_producto')
    .select('*')
    .eq('producto_id', productoId)
    .order('color');
  if (error) throw error;
  return data;
}

async function bulkColores(productoId, colores) {
  const { error: delError } = await supabase
    .from('colores_producto').delete().eq('producto_id', productoId);
  if (delError) throw delError;

  if (!colores || colores.length === 0) return [];

  const rows = colores
    .map(c => ({ producto_id: productoId, color: String(c.color || c).trim() }))
    .filter(r => r.color);

  if (rows.length === 0) return [];

  const { data, error } = await supabase.from('colores_producto').insert(rows).select();
  if (error) throw error;
  return data;
}

// ===== VARIANTES =====
async function listarVariantes(productoId) {
  const { data, error } = await supabase
    .from('variantes_producto')
    .select('*')
    .eq('producto_id', productoId)
    .order('talla');
  if (error) throw error;
  return data;
}

async function bulkVariantes(productoId, variantes) {
  // Reemplaza todas las variantes del producto
  const { error: delError } = await supabase
    .from('variantes_producto')
    .delete()
    .eq('producto_id', productoId);
  if (delError) throw delError;

  if (!variantes || variantes.length === 0) return [];

  const rows = variantes.map(v => ({
    producto_id: productoId,
    talla:       String(v.talla || '').trim(),
    precio:      parseFloat(v.precio) || 0,
    stock:       parseInt(v.stock, 10) || 0
  })).filter(v => v.talla);

  if (rows.length === 0) return [];

  const { data, error } = await supabase
    .from('variantes_producto')
    .insert(rows)
    .select();
  if (error) throw error;
  return data;
}

module.exports = { listar, todos, detalle, crear, editar, toggle, eliminar, uploadImagen, listarVariantes, bulkVariantes, listarColores, bulkColores };
