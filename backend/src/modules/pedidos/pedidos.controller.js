const svc = require('./pedidos.service');

async function listar(req, res, next) {
  try { res.json(await svc.listar(req.query)); } catch (err) { next(err); }
}
async function crear(req, res, next) {
  try {
    const { items } = req.body;
    if (!items || !items.length)
      return res.status(400).json({ error: 'El pedido debe tener al menos un producto' });
    res.status(201).json(await svc.crear({ ...req.body, usuario_id: req.user.id }));
  } catch (err) { next(err); }
}
async function editar(req, res, next) {
  try { res.json(await svc.editar(req.params.id, req.body)); } catch (err) { next(err); }
}
async function cambiarEstado(req, res, next) {
  try {
    const { estado_id } = req.body;
    if (!estado_id) return res.status(400).json({ error: 'estado_id requerido' });
    res.json(await svc.cambiarEstado(req.params.id, estado_id));
  } catch (err) { next(err); }
}

module.exports = { listar, crear, editar, cambiarEstado };
