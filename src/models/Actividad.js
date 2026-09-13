const mongoose = require('mongoose');

const actividadSchema = new mongoose.Schema({
    jugadorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jugador',
        required: true
    },
    turno: { type: Number, required: true, default: 1 },
    tipo: { type: String, enum: ['email', 'logs'], required: true },
    descripcion: { type: String, required: true },
    dificultad: {
        type: String,
        enum: ['baja', 'media', 'alta'],
        default: 'media'
    },
    nivelRiesgo: { type: Number, required: true },
    esMalicioso: { type: Boolean, default: false },
    estado: {
        type: String,
        enum: ['pendiente', 'resuelta', 'ignorada'],
        default: 'pendiente'
    },
    fecha: { type: Date, default: Date.now },
    hora: { type: String }
}, { discriminatorKey: 'tipo', timestamps: true });

module.exports = mongoose.models.Actividad || mongoose.model('Actividad', actividadSchema);