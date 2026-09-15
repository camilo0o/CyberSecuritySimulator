const express = require('express');
const actividadController = require('../controllers/actividadController');
const { autenticar } = require('../middlewares/auth');
const router = express.Router();
router.get('/:id', autenticar, actividadController.obtenerDetalle);
router.post('/:id/resolver', autenticar, actividadController.resolver);
module.exports = router;
