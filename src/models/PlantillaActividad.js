const mongoose = require('mongoose');
const correoSchema = require('./Correo');
const { logSchema } = require('./Logs');

const plantillaActividadSchema = new mongoose.Schema({
    descripcion: { type: String, required: true },
    dificultad: { type: String, enum: ['baja', 'media', 'alta'], default: 'media' },
    nivelRiesgo: { type: Number, required: true },
    esMalicioso: { type: Boolean, default: false },
    correo: { type: correoSchema, required: true },
    logs: { type: [logSchema], required: true }
}, { timestamps: true });

module.exports = mongoose.models.PlantillaActividad ||
    mongoose.model('PlantillaActividad', plantillaActividadSchema);