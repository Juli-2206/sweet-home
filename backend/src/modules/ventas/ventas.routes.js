const router = require('express').Router();
const auth   = require('../../middleware/auth');
const roles  = require('../../middleware/roles');
const ctrl   = require('./ventas.controller');

router.get('/',        auth, roles('admin','negocios'), ctrl.listar);
router.post('/',       auth, roles('admin','negocios'), ctrl.registrar);
router.get('/resumen', auth, roles('admin','negocios'), ctrl.resumen);

module.exports = router;
