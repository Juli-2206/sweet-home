const router = require('express').Router();
const auth   = require('../../middleware/auth');
const roles  = require('../../middleware/roles');
const ctrl   = require('./tipos-entrega.controller');

router.get('/',     auth, roles('admin','negocios'), ctrl.listar);
router.post('/',    auth, roles('admin','negocios'), ctrl.crear);
router.delete('/:id', auth, roles('admin','negocios'), ctrl.eliminar);

module.exports = router;
