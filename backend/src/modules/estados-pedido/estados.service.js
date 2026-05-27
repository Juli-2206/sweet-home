const supabase = require('../../config/supabase');

const tabla = 'estados_pedido';

async function listar() {
  const { data, error } = await supabase.from(tabla).select('*').order('orden');
  if (error) throw error;
  return data;
}
async function crear(payload) {
  const { data, error } = await supabase.from(tabla).insert(payload).select().single();
  if (error) throw error;
  return data;
}
async function editar(id, payload) {
  const { data, error } = await supabase.from(tabla).update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}
async function toggle(id) {
  const { data: actual } = await supabase.from(tabla).select('activo').eq('id', id).single();
  const { data, error } = await supabase.from(tabla).update({ activo: !actual.activo }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

module.exports = { listar, crear, editar, toggle };
