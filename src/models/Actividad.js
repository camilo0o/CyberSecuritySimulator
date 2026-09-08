const mongoose = require('mongoose');

const actividadSchema = new mongoose.Schema({
    jugadorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Jugador', required: true }, // relación "realiza"
    tipo: { type: String, enum: ['email', 'logs'], required: true },
    descripcion: { type: String, required: true },
    dificultad: { type: String, enum: ['baja', 'media', 'alta'], default: 'media' },
    nivelRiesgo: { type: Number, required: true },
    estado: { type: String, enum: ['pendiente', 'resuelta', 'ignorada'], default: 'pendiente' },
    fecha: { type: Date, default: Date.now },
    hora: { type: String }, // "14:30" — o fusionalo con fecha en un solo Date
}, { discriminatorKey: 'tipo', timestamps: true });

module.exports = mongoose.model('Actividad', actividadSchema);