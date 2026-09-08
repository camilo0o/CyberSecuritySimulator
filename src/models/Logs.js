const mongoose = require('mongoose');
const Actividad = require('./Actividad');

const logsSchema = new mongoose.Schema({
    contenido: { type: String, required: true },
    direccionIp: { type: String, required: true },
    ubicacion: { type: String },
    dispositivo: { type: String },
    usuario: { type: String },
    tipoAcceso: { type: String },
});

module.exports = Actividad.discriminator('logs', logsSchema);