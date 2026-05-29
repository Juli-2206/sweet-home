const svc = require('./ventas.service');

async function listar(req, res, next) {
  try { res.json(await svc.listar(req.query)); } catch(err) { next(err); }
}

async function registrar(req, res, next) {
  try { res.status(201).json(await svc.registrar(req.body)); } catch(err) { next(err); }
}

async function resumen(req, res, next) {
  try { res.json(await svc.resumen(req.query)); } catch(err) { next(err); }
}

module.exports = { listar, registrar, resumen };
