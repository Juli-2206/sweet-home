const svc = require('./usuarios.service');

async function listar(req, res, next) {
  try { res.json(await svc.listarUsuarios()); }
  catch (err) { next(err); }
}

async function crear(req, res, next) {
  try {
    const { nombre, email, password, rol_id } = req.body;
    if (!nombre || !email || !password || !rol_id)
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    res.status(201).json(await svc.crearUsuario({ nombre, email, password, rol_id }));
  } catch (err) { next(err); }
}

async function editar(req, res, next) {
  try { res.json(await svc.editarUsuario(req.params.id, req.body)); }
  catch (err) { next(err); }
}

async function toggle(req, res, next) {
  try { res.json(await svc.toggleUsuario(req.params.id)); }
  catch (err) { next(err); }
}

module.exports = { listar, crear, editar, toggle };
