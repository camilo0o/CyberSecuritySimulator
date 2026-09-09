const Jugador = require('../models/Jugador');

async function crearJugador(nombre) {
    return await Jugador.create({ nombre });
}

module.exports = { crearJugador };