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
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre del producto es requerido' });
    res.status(201).json(await svc.crear(req.body));
  } catch (err) { next(err); }
}
async function editar(req, res, next) {
  try { res.json(await svc.editar(req.params.id, req.body)); } catch (err) { next(err); }
}
async function toggle(req, res, next) {
  try { res.json(await svc.toggle(req.params.id)); } catch (err) { next(err); }
}
async function uploadImagen(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se envio ningun archivo' });
    const url = await svc.uploadImagen(req.file);
    res.json({ url });
  } catch(err) { next(err); }
}
async function eliminar(req, res, next) {
  try { res.json(await svc.eliminar(req.params.id)); } catch(err) { next(err); }
}
async function listarColores(req, res, next) {
  try { res.json(await svc.listarColores(req.params.id)); } catch(err) { next(err); }
}
async function bulkColores(req, res, next) {
  try {
    const { colores } = req.body;
    res.json(await svc.bulkColores(req.params.id, colores || []));
  } catch(err) { next(err); }
}
async function listarVariantes(req, res, next) {
  try { res.json(await svc.listarVariantes(req.params.id)); } catch(err) { next(err); }
}
async function bulkVariantes(req, res, next) {
  try {
    const { variantes } = req.body;
    res.json(await svc.bulkVariantes(req.params.id, variantes || []));
  } catch(err) { next(err); }
}

module.exports = { listar, todos, detalle, crear, editar, toggle, eliminar, uploadImagen, listarVariantes, bulkVariantes, listarColores, bulkColores };
