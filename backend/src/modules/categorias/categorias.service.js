const supabase = require('../../config/supabase');

async function listarActivas() {
  const { data, error } = await supabase
    .from('categorias').select('id, nombre').eq('activo', true).order('nombre');
  if (error) throw error;
  return data;
}

async function listarTodas() {
  const { data, error } = await supabase
    .from('categorias').select('*').order('nombre');
  if (error) throw error;
  return data;
}

async function crear({ nombre }) {
  const { data, error } = await supabase
    .from('categorias').insert({ nombre }).select().single();
  if (error) throw error;
  return data;
}

async function editar(id, { nombre }) {
  const { data, error } = await supabase
    .from('categorias').update({ nombre }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

async function toggle(id) {
  const { data: actual } = await supabase
    .from('categorias').select('activo').eq('id', id).single();
  const { data, error } = await supabase
    .from('categorias').update({ activo: !actual.activo }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

async function eliminar(id) {
  // Verificar que no tenga productos asociados
  const { data: prods } = await supabase
    .from('productos')
    .select('id')
    .eq('categoria_id', id)
    .limit(1);

  if (prods && prods.length > 0) {
    const err = new Error('No se puede eliminar: la categoría tiene productos asociados');
    err.status = 400;
    throw err;
  }

  const { error } = await supabase.from('categorias').delete().eq('id', id);
  if (error) throw error;
  return { mensaje: 'Categoría eliminada' };
}

module.exports = { listarActivas, listarTodas, crear, editar, toggle, eliminar };
