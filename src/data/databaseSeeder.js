const PlantillaActividad = require('../models/PlantillaActividad');

async function elegirAlAzar(cantidad) {
    if (cantidad <= 0) {
        return [];
    }

    return PlantillaActividad.aggregate([
        { $sample: { size: cantidad } }
    ]);
}

function construirActividad(plantilla, empresaId, jugadorId, turno) {
    const { _id, __v, createdAt, updatedAt, ...campos } = plantilla;

    return {
        ...campos,
        // Cada ticket necesita sus propios logs, sin reutilizar los _id de la plantilla
        logs: (campos.logs || []).map(({ _id: logId, ...log }) => log),
        empresaId,
        jugadorId,
        turno,
        estado: 'pendiente'
    };
}

async function generarActividadesDeTurno(empresaId, jugadorId, turno, cantidad = 1) {
    const plantillas = await elegirAlAzar(cantidad);

    return plantillas.map(
        plantilla => construirActividad(plantilla, empresaId, jugadorId, turno)
    );
}

module.exports = { generarActividadesDeTurno };
