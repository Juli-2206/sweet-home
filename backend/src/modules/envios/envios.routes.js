const router = require('express').Router();
const auth   = require('../../middleware/auth');
const roles  = require('../../middleware/roles');
const ctrl   = require('./envios.controller');

router.get('/',              auth, roles('admin','negocios'), ctrl.listar);
router.post('/',             auth, roles('admin','negocios'), ctrl.crear);
router.put('/:id',           auth, roles('admin','negocios'), ctrl.actualizar);
router.patch('/:id/estado',  auth, roles('admin','negocios'), ctrl.cambiarEstado);
router.delete('/:id',        auth, roles('admin','negocios'), ctrl.eliminar);

module.exports = router;
