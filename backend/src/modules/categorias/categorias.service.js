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

module.exports = { listarActivas, listarTodas, crear, editar, toggle };
