const mongoose = require('mongoose');

const empresaSchema = new mongoose.Schema({
    seguridad: { type: Number, required: true, default: 100 },
    reputacion: { type: Number, required: true, default: 100 },
    dinero: { type: Number, required: true, default: 10000 },
}, { timestamps: true });

module.exports = mongoose.model('Empresa', empresaSchema);