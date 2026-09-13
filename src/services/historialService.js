const Historial = require('../models/Historial');

async function crearHistorial({
    jugadorId,
    empresaId,
    nombreJugador,
    seguridadFinal,
    reputacionFinal,
    dineroFinal
}, session) {
    const [historial] = await Historial.create([{
        jugadorId,
        empresaId,
        nombreJugador,
        seguridadFinal,
        reputacionFinal,
        dineroFinal
    }], { session });

    return historial;
}

async function obtenerRanking() {
    const historiales = await Historial.find({})
        .sort({
            seguridadFinal: -1,
            reputacionFinal: -1,
            dineroFinal: -1,
            createdAt: 1
        })
        .lean();

    return historiales.map((historial, indice) => ({
        posicion: indice + 1,
        ...historial
    }));
}

module.exports = {
    crearHistorial,
    obtenerRanking
};