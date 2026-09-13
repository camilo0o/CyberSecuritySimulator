const mongoose = require('mongoose');

const empresaSchema = new mongoose.Schema({
    seguridad: { type: Number, required: true, default: 100 },
    reputacion: { type: Number, required: true, default: 100 },
    dinero: { type: Number, required: true, default: 10000 },

    turno: { type: Number, required: true, default: 1 },
    maxTurnos: { type: Number, required: true, default: 10 },
    estado: {
        type: String,
        enum: ['activa', 'victoria', 'derrota'],
        default: 'activa'
    }
}, { timestamps: true });

module.exports = mongoose.models.Empresa || mongoose.model('Empresa', empresaSchema);