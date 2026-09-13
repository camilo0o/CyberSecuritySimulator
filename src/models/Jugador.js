const mongoose = require('mongoose');

const jugadorSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    empresaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa' }, // relación "pertenece"
}, { timestamps: true });

module.exports = mongoose.models.Jugador || mongoose.model('Jugador', jugadorSchema);