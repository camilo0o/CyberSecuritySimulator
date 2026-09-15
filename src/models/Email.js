const mongoose = require('mongoose');
const Actividad = require('./Actividad');

const emailSchema = new mongoose.Schema({
    titulo: { type: String },
    remitente: { type: String },
    destinatario: { type: String },
    contenido: { type: String },
    tieneAdjunto: { type: Boolean },
    nombreAdjunto: { type: String },
    enlace: { type: String },
    esMalicioso: { type: Boolean },
});

module.exports = Actividad.discriminators?.email ||
    Actividad.discriminator('email', emailSchema);
