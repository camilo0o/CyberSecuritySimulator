const mongoose = require('mongoose');

const ARCHIVOS_LOG = ['mail.log', 'auth.log', 'proxy.log', 'sandbox.log'];

const logSchema = new mongoose.Schema({
    archivo: { type: String, enum: ARCHIVOS_LOG, required: true },
    fecha: { type: Date, default: Date.now },
    hora: { type: String, required: true },
    contenido: { type: String, required: true },
    direccionIp: { type: String },
    ubicacion: { type: String },
    dispositivo: { type: String },
    usuario: { type: String },
    tipoAcceso: { type: String }
});

module.exports = { logSchema, ARCHIVOS_LOG };