const express = require('express');
const router = express.Router();

const actividadController = require('../controllers/actividadController');
const empresaController = require('../controllers/empresaController');
const { autenticar } = require('../middlewares/auth');

router.post('/', autenticar, empresaController.crearEmpresa);
router.get('/:id/actividades', autenticar, actividadController.listarPorEmpresa);
router.get('/:id', autenticar, empresaController.obtenerEstadoEmpresa);
router.post('/:id/avanzar', autenticar, empresaController.avanzar);
router.post('/:id/rendirse', autenticar, empresaController.rendirse);

module.exports = router;
