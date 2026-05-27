const svc = require('./informes.service');

async function ventas(req, res, next) {
  try { res.json(await svc.ventas(req.query)); } catch (err) { next(err); }
}
async function productosTop(req, res, next) {
  try { res.json(await svc.productosTop(req.query)); } catch (err) { next(err); }
}
async function stockBajo(req, res, next) {
  try { res.json(await svc.stockBajo()); } catch (err) { next(err); }
}
async function movimientos(req, res, next) {
  try { res.json(await svc.movimientos(req.query)); } catch (err) { next(err); }
}

module.exports = { ventas, productosTop, stockBajo, movimientos };
