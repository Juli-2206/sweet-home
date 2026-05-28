const supabase = require('../../config/supabase');

async function listar({ categoria, nombre }) {
  let query = supabase
    .from('productos')
    .select('id, nombre, descripcion, precio, imagen_url, imagenes, stock, categorias(id, nombre)')
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

module.exports = { listar, todos, detalle, crear, editar, toggle, uploadImagen };
