const svc = require('./envios.service');

async function listar(req, res, next) {
  try { res.json(await svc.listar(req.query)); } catch (err) { next(err); }
}

async function crear(req, res, next) {
  try { res.status(201).json(await svc.crear(req.body)); } catch (err) { next(err); }
}

async function actualizar(req, res, next) {
  try { res.json(await svc.actualizar(req.params.id, req.body)); } catch (err) { next(err); }
}

async function cambiarEstado(req, res, next) {
  try {
    const { estado_id } = req.body;
    res.json(await svc.cambiarEstado(req.params.id, estado_id));
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try { res.json(await svc.eliminar(req.params.id)); } catch (err) { next(err); }
}

module.exports = { listar, crear, actualizar, cambiarEstado, eliminar };
