const router = require('express').Router();
const auth  = require('../../middleware/auth');
const roles = require('../../middleware/roles');
const ctrl  = require('./usuarios.controller');

router.get('/',            auth, roles('admin'), ctrl.listar);
router.post('/',           auth, roles('admin'), ctrl.crear);
router.put('/:id',         auth, roles('admin'), ctrl.editar);
router.patch('/:id/toggle',auth, roles('admin'), ctrl.toggle);

module.exports = router;
