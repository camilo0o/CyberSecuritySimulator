const mongoose = require('mongoose');
const Actividad = require('./Actividad');

const emailSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    remitente: { type: String, required: true },
    destinatario: { type: String, required: true },
    contenido: { type: String, required: true },
    tieneAdjunto: { type: Boolean },
    nombreAdjunto: { type: String },
    enlace: { type: String },
    esMalicioso: { type: Boolean },
});

module.exports = Actividad.discriminator('email', emailSchema);