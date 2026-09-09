const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresaController');

router.post('/', empresaController.crearEmpresa);
router.get('/:id', empresaController.obtenerEstadoEmpresa);

module.exports = router;