const supabase = require('../config/supabase');

async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const token = header.split(' ')[1];

  // Verificar JWT con Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  // Obtener perfil completo con rol
  const { data: usuario, error: errUsuario } = await supabase
    .from('usuarios')
    .select('*, roles(nombre)')
    .eq('id', user.id)
    .single();

  if (errUsuario || !usuario) {
    return res.status(401).json({ error: 'Usuario no encontrado' });
  }

  if (!usuario.activo) {
    return res.status(403).json({ error: 'Usuario deshabilitado' });
  }

  req.user = {
    id:    usuario.id,
    email: usuario.email,
    nombre: usuario.nombre,
    rol:   usuario.roles.nombre
  };

  next();
}

module.exports = auth;
