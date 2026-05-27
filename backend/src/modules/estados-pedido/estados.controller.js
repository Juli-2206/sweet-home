const svc = require('./estados.service');

async function listar(req, res, next) {
  try { res.json(await svc.listar()); } catch (err) { next(err); }
}
async function crear(req, res, next) {
  try {
    if (!req.body.nombre) return res.status(400).json({ error: 'Nombre requerido' });
    res.status(201).json(await svc.crear(req.body));
  } catch (err) { next(err); }
}
async function editar(req, res, next) {
  try { res.json(await svc.editar(req.params.id, req.body)); } catch (err) { next(err); }
}
async function toggle(req, res, next) {
  try { res.json(await svc.toggle(req.params.id)); } catch (err) { next(err); }
}

module.exports = { listar, crear, editar, toggle };
