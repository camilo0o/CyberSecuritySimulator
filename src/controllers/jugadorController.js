const { validarCrearJugador } = require('../validators/jugadorValidator');
const { crearJugador: crearJugadorService } = require('../services/jugadorService');

async function crearJugador(req, res, next) {
    try {
        const validacion = validarCrearJugador(req.body);
        if (!validacion.valido) {
            return res.status(400).json({ error: validacion.error });
        }

        const jugador = await crearJugadorService(req.body.nombre);
        res.status(201).json(jugador);
    } catch (err) {
        next(err);
    }
}

module.exports = { crearJugador };