const mongoose = require('mongoose');
const Actividad = require('./Actividad');

const logsSchema = new mongoose.Schema({
    contenido: { type: String },
    direccionIp: { type: String },
    ubicacion: { type: String },
    dispositivo: { type: String },
    usuario: { type: String },
    tipoAcceso: { type: String },
});

module.exports = Actividad.discriminators?.logs ||
    Actividad.discriminator('logs', logsSchema);
