const router = require('express').Router();
const multer = require('multer');
const auth   = require('../../middleware/auth');
const roles  = require('../../middleware/roles');
const ctrl   = require('./productos.controller');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo se permiten imágenes'));
  }
});

router.get('/',              ctrl.listar);                             // Público: activos, con filtros
router.get('/todos', auth, roles('admin','negocios'), ctrl.todos);    // Admin/Negocios: todos
router.get('/:id',           ctrl.detalle);                           // Público
router.post('/upload', auth, roles('admin','negocios'), upload.single('imagen'), ctrl.uploadImagen);
router.post('/',       auth, roles('admin','negocios'), ctrl.crear);
router.put('/:id',     auth, roles('admin','negocios'), ctrl.editar);
router.patch('/:id/toggle', auth, roles('admin','negocios'), ctrl.toggle);

module.exports = router;
