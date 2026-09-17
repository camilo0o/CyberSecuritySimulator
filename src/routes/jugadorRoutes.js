const express = require('express');
const router = express.Router();
const { autenticar } = require('../middlewares/auth');

const jugadorController = require('../controllers/jugadorController');

router.post('/registro', jugadorController.registrar);
router.post('/login', jugadorController.login);
router.post('/logout', autenticar, jugadorController.logout);

module.exports = router;