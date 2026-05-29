const svc = require('./tipos-entrega.service');

async function listar(req, res, next) {
  try { res.json(await svc.listar()); } catch (err) { next(err); }
}

async function crear(req, res, next) {
  try {
    if (!req.body.nombre) return res.status(400).json({ error: 'Nombre requerido' });
    res.status(201).json(await svc.crear(req.body));
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try { res.json(await svc.eliminar(req.params.id)); } catch (err) { next(err); }
}

module.exports = { listar, crear, eliminar };
