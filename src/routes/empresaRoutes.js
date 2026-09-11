const express = require('express');
const router = express.Router();

const empresaController = require('../controllers/empresaController');
const { autenticar } = require('../middlewares/auth');

router.post('/', autenticar, empresaController.crearEmpresa);
router.get('/:id', autenticar, empresaController.obtenerEstadoEmpresa);

module.exports = router;