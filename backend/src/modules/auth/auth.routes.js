const router = require('express').Router();
const auth = require('../../middleware/auth');
const ctrl = require('./auth.controller');

router.post('/login',  ctrl.login);
router.post('/logout', auth, ctrl.logout);
router.get('/me',      auth, ctrl.me);

module.exports = router;
