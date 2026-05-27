const svc = require('./productos.service');

async function listar(req, res, next) {
  try { res.json(await svc.listar(req.query)); } catch (err) { next(err); }
}
async function todos(req, res, next) {
  try { res.json(await svc.todos(req.query)); } catch (err) { next(err); }
}
async function detalle(req, res, next) {
  try {
    const prod = await svc.detalle(req.params.id);
    if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(prod);
  } catch (err) { next(err); }
}
async function crear(req, res, next) {
  try {
    const { nombre, precio } = req.body;
    if (!nombre || !precio)
      return res.status(400).json({ error: 'Nombre y precio son requeridos' });
    res.status(201).json(await svc.crear(req.body));
  } catch (err) { next(err); }
}
async function editar(req, res, next) {
  try { res.json(await svc.editar(req.params.id, req.body)); } catch (err) { next(err); }
}
async function toggle(req, res, next) {
  try { res.json(await svc.toggle(req.params.id)); } catch (err) { next(err); }
}

module.exports = { listar, todos, detalle, crear, editar, toggle };
