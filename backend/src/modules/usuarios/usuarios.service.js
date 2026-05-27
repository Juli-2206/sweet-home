const supabase = require('../../config/supabase');

async function listarUsuarios() {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, email, activo, creado_en, roles(id, nombre)')
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return data;
}

async function crearUsuario({ nombre, email, password, rol_id }) {
  // 1. Crear en Supabase Auth
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true
  });
  if (authErr) throw authErr;

  // 2. Insertar en tabla usuarios
  const { data, error } = await supabase
    .from('usuarios')
    .insert({ id: authData.user.id, nombre, email, rol_id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function editarUsuario(id, { nombre, rol_id }) {
  const { data, error } = await supabase
    .from('usuarios')
    .update({ nombre, rol_id })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function toggleUsuario(id) {
  const { data: actual } = await supabase
    .from('usuarios').select('activo').eq('id', id).single();

  const { data, error } = await supabase
    .from('usuarios')
    .update({ activo: !actual.activo })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

module.exports = { listarUsuarios, crearUsuario, editarUsuario, toggleUsuario };
