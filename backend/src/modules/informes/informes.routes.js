const router = require('express').Router();
const auth  = require('../../middleware/auth');
const roles = require('../../middleware/roles');
const ctrl  = require('./informes.controller');

router.get('/ventas',         auth, roles('admin','negocios'), ctrl.ventas);
router.get('/productos-top',  auth, roles('admin','negocios'), ctrl.productosTop);
router.get('/stock-bajo',     auth, roles('admin','negocios'), ctrl.stockBajo);
router.get('/movimientos',    auth, roles('admin','negocios'), ctrl.movimientos);

module.exports = router;
