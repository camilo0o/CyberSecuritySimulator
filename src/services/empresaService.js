const Jugador = require('../models/Jugador');
const Empresa = require('../models/Empresa');

async function iniciarPartida(jugadorId) {
    const jugador = await Jugador.findById(jugadorId);
    if (!jugador) {
        const error = new Error('Jugador no encontrado');
        error.statusCode = 404;
        throw error;
    }

    const empresa = await Empresa.create({});
    jugador.empresaId = empresa._id;
    await jugador.save();

    return empresa;
}

async function obtenerEstado(empresaId) {
    const empresa = await Empresa.findById(empresaId);
    if (!empresa) {
        const error = new Error('Empresa no encontrada');
        error.statusCode = 404;
        throw error;
    }
    return empresa;
}

module.exports = { iniciarPartida, obtenerEstado };