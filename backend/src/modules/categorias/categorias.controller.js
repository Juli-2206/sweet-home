const svc = require('./categorias.service');

async function listar(req, res, next) {
  try { res.json(await svc.listarActivas()); } catch (err) { next(err); }
}
async function todas(req, res, next) {
  try { res.json(await svc.listarTodas()); } catch (err) { next(err); }
}
async function crear(req, res, next) {
  try {
    if (!req.body.nombre)
      return res.status(400).json({ error: 'El nombre es requerido' });
    res.status(201).json(await svc.crear(req.body));
  } catch (err) { next(err); }
}
async function editar(req, res, next) {
  try { res.json(await svc.editar(req.params.id, req.body)); } catch (err) { next(err); }
}
async function toggle(req, res, next) {
  try { res.json(await svc.toggle(req.params.id)); } catch (err) { next(err); }
}

module.exports = { listar, todas, crear, editar, toggle };
