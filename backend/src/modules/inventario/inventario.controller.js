const svc = require('./inventario.service');

async function historial(req, res, next) {
  try { res.json(await svc.historial(req.params.producto_id)); } catch (err) { next(err); }
}

async function entrada(req, res, next) {
  try {
    const { producto_id, cantidad, motivo } = req.body;
    if (!producto_id || !cantidad)
      return res.status(400).json({ error: 'producto_id y cantidad son requeridos' });
    res.status(201).json(await svc.registrarMovimiento({
      producto_id, tipo: 'entrada', cantidad, motivo, usuario_id: req.user.id
    }));
  } catch (err) { next(err); }
}

async function salida(req, res, next) {
  try {
    const { producto_id, cantidad, motivo, pedido_id } = req.body;
    if (!producto_id || !cantidad)
      return res.status(400).json({ error: 'producto_id y cantidad son requeridos' });
    res.status(201).json(await svc.registrarMovimiento({
      producto_id, tipo: 'salida', cantidad, motivo, pedido_id, usuario_id: req.user.id
    }));
  } catch (err) { next(err); }
}

module.exports = { historial, entrada, salida };
