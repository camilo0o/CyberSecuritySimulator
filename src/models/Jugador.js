const mongoose = require('mongoose');

const jugadorSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    empresaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa' },
    tokenVersion: { type: Number, required: true, default: 0 },
}, { timestamps: true });

jugadorSchema.set('toJSON', {
    transform: (doc, ret) => { delete ret.password; return ret; }
});

module.exports = mongoose.models.Jugador || mongoose.model('Jugador', jugadorSchema);