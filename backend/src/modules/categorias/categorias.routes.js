const router = require('express').Router();
const auth  = require('../../middleware/auth');
const roles = require('../../middleware/roles');
const ctrl  = require('./categorias.controller');

router.get('/',              ctrl.listar);          // Público: solo activas
router.get('/todas',  auth, roles('admin'), ctrl.todas); // Admin: todas
router.post('/',      auth, roles('admin'), ctrl.crear);
router.put('/:id',    auth, roles('admin'), ctrl.editar);
router.patch('/:id/toggle', auth, roles('admin'), ctrl.toggle);

module.exports = router;
