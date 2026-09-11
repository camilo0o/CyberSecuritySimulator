const { validarCrearJugador } = require('../validators/jugadorValidator');
const { crearJugador: crearJugadorService } = require('../services/jugadorService');
const { crearTokenJugador } = require('../utils/token');

async function crearJugador(req, res, next) {
    try {
        const validacion = validarCrearJugador(req.body);

        if (!validacion.valido) {
            return res.status(400).json({
                error: validacion.error
            });
        }

        const jugador = await crearJugadorService(req.body.nombre);
        const token = crearTokenJugador(jugador._id);

        res.status(201).json({
            jugador,
            token
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { crearJugador };