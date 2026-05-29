const supabase = require('../../config/supabase');
const tabla = 'tipos_entrega';

async function listar() {
  const { data, error } = await supabase.from(tabla).select('*').eq('activo', true).order('id');
  if (error) throw error;
  return data;
}

async function crear({ nombre }) {
  const { data, error } = await supabase.from(tabla).insert({ nombre }).select().single();
  if (error) throw error;
  return data;
}

async function eliminar(id) {
  const { error } = await supabase.from(tabla).delete().eq('id', id);
  if (error) throw error;
  return { ok: true };
}

module.exports = { listar, crear, eliminar };
