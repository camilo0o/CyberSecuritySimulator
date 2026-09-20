const PlantillaActividad = require('../models/PlantillaActividad');
const { BANCO_TICKETS } = require('./plantillasContenido');

async function sembrarPlantillas({ forzar = false } = {}) {
    const existentes = await PlantillaActividad.countDocuments();

    if (existentes > 0 && !forzar) {
        return { insertadas: 0, yaExistian: existentes };
    }

    if (forzar) {
        await PlantillaActividad.deleteMany({});
    }

    const insertadas = await PlantillaActividad.insertMany(BANCO_TICKETS);

    return { insertadas: insertadas.length, yaExistian: 0 };
}

module.exports = { sembrarPlantillas };
