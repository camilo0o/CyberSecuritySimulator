const express = require('express');
const historialController = require('../controllers/historialController');
const { autenticar } = require('../middlewares/auth');

const router = express.Router();

router.get(
    '/ranking',
    autenticar,
    historialController.ranking
);

module.exports = router;