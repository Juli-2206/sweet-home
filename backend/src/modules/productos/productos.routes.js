const router = require('express').Router();
const auth  = require('../../middleware/auth');
const roles = require('../../middleware/roles');
const ctrl  = require('./productos.controller');

router.get('/',              ctrl.listar);                             // Público: activos, con filtros
router.get('/todos', auth, roles('admin','negocios'), ctrl.todos);    // Admin/Negocios: todos
router.get('/:id',           ctrl.detalle);                           // Público
router.post('/',       auth, roles('admin','negocios'), ctrl.crear);
router.put('/:id',     auth, roles('admin','negocios'), ctrl.editar);
router.patch('/:id/toggle', auth, roles('admin','negocios'), ctrl.toggle);

module.exports = router;
