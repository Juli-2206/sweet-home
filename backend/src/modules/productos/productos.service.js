const supabase = require('../../config/supabase');

async function listar({ categoria, nombre }) {
  let query = supabase
    .from('productos')
    .select('id, nombre, descripcion, precio, imagen_url, stock, categorias(id, nombre)')
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

module.exports = { listar, todos, detalle, crear, editar, toggle };
