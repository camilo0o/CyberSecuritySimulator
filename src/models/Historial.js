const mongoose = require('mongoose');

const historialSchema = new mongoose.Schema({
    jugadorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Jugador', required: true }, // relación "tiene"
    empresaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa', required: true }, // relación "posee"
    nombreJugador: { type: String, required: true },
    fecha: { type: Date, default: Date.now },
    hora: { type: String },
    seguridadFinal: { type: Number, required: true },
    reputacionFinal: { type: Number, required: true },
    dineroFinal: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Historial', historialSchema);