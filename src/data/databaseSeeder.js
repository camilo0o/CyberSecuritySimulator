const PlantillaActividad = require('../models/PlantillaActividad');

async function elegirAlAzar(cantidad) {
    if (cantidad <= 0) {
        return [];
    }

    return PlantillaActividad.aggregate([
        { $sample: { size: cantidad } }
    ]);
}

function construirActividad(plantilla, jugadorId, turno) {
    const { _id, __v, createdAt, updatedAt, ...campos } = plantilla;

    return {
        ...campos,
        // Cada ticket necesita sus propios logs, sin reutilizar los _id de la plantilla
        logs: (campos.logs || []).map(({ _id: logId, ...log }) => log),
        jugadorId,
        turno,
        estado: 'pendiente'
    };
}

async function generarActividadesDeTurno(jugadorId, turno, cantidad = 2) {
    const plantillas = await elegirAlAzar(cantidad);

    return plantillas.map(
        plantilla => construirActividad(plantilla, jugadorId, turno)
    );
}

module.exports = { generarActividadesDeTurno };
