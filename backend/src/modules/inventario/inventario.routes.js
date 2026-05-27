const router = require('express').Router();
const auth  = require('../../middleware/auth');
const roles = require('../../middleware/roles');
const ctrl  = require('./inventario.controller');

router.get('/:producto_id',  auth, roles('admin','negocios'), ctrl.historial);
router.post('/entrada',      auth, roles('admin','negocios'), ctrl.entrada);
router.post('/salida',       auth, roles('admin','negocios'), ctrl.salida);

module.exports = router;
