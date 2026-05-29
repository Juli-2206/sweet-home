const supabase = require('../../config/supabase');
const tabla = 'envios';

async function listar({ estado_id } = {}) {
  let query = supabase
    .from(tabla)
    .select('*, estados_pedido(id, nombre, color)')
    .order('fecha', { ascending: false });

  if (estado_id) query = query.eq('estado_id', estado_id);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function crear(payload) {
  const { cedula, nombre, celular, direccion, tipo_entrega, numero_guia, estado_id, notas } = payload;
  if (!nombre || !direccion || !tipo_entrega) {
    const err = new Error('Nombre, dirección y tipo de entrega son requeridos');
    err.status = 400;
    throw err;
  }
  const { data, error } = await supabase
    .from(tabla)
    .insert({ cedula, nombre, celular, direccion, tipo_entrega, numero_guia: numero_guia || null, estado_id: estado_id || null, notas: notas || null })
    .select('*, estados_pedido(id, nombre, color)')
    .single();
  if (error) throw error;
  return data;
}

async function actualizar(id, payload) {
  const { cedula, nombre, celular, direccion, tipo_entrega, numero_guia, estado_id, notas } = payload;
  const { data, error } = await supabase
    .from(tabla)
    .update({ cedula, nombre, celular, direccion, tipo_entrega, numero_guia: numero_guia || null, estado_id: estado_id || null, notas: notas || null })
    .eq('id', id)
    .select('*, estados_pedido(id, nombre, color)')
    .single();
  if (error) throw error;
  return data;
}

async function cambiarEstado(id, estado_id) {
  const { data, error } = await supabase
    .from(tabla)
    .update({ estado_id: estado_id || null })
    .eq('id', id)
    .select('*, estados_pedido(id, nombre, color)')
    .single();
  if (error) throw error;
  return data;
}

async function eliminar(id) {
  const { error } = await supabase.from(tabla).delete().eq('id', id);
  if (error) throw error;
  return { ok: true };
}

module.exports = { listar, crear, actualizar, cambiarEstado, eliminar };
