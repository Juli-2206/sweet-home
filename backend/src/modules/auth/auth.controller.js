const supabase = require('../../config/supabase');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email y contraseña requeridos' });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: 'Credenciales incorrectas' });

    // Obtener perfil con rol
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id, nombre, email, activo, roles(nombre)')
      .eq('id', data.user.id)
      .single();

    if (!usuario?.activo)
      return res.status(403).json({ error: 'Usuario deshabilitado' });

    res.json({
      token:         data.session.access_token,
      refresh_token: data.session.refresh_token,
      usuario: {
        id:     usuario.id,
        nombre: usuario.nombre,
        email:  usuario.email,
        rol:    usuario.roles.nombre
      }
    });
  } catch (err) { next(err); }
}

async function refresh(req, res, next) {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) return res.status(400).json({ error: 'refresh_token requerido' });

    const { data, error } = await supabase.auth.refreshSession({ refresh_token });
    if (error || !data?.session)
      return res.status(401).json({ error: 'Sesión expirada, inicia sesión nuevamente' });

    res.json({
      token:         data.session.access_token,
      refresh_token: data.session.refresh_token
    });
  } catch(err) { next(err); }
}

async function logout(req, res, next) {
  try {
    await supabase.auth.signOut();
    res.json({ mensaje: 'Sesión cerrada' });
  } catch (err) { next(err); }
}

function me(req, res) {
  res.json({ usuario: req.user });
}

module.exports = { login, refresh, logout, me };
