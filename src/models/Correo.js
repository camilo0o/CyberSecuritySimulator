const mongoose = require('mongoose');

const correoSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    remitente: { type: String, required: true },
    destinatario: { type: String, required: true },
    contenido: { type: String, required: true },
    tieneAdjunto: { type: Boolean, default: false },
    nombreAdjunto: { type: String },
    enlace: { type: String }
}, { _id: false });

module.exports = correoSchema;