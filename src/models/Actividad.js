const mongoose = require('mongoose');

const correoSchema = require('./Correo');
const { logSchema } = require('./Logs');

const actividadSchema = new mongoose.Schema({
    empresaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa', required: true },
    jugadorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Jugador', required: true },
    turno: { type: Number, required: true, default: 1 },
    descripcion: { type: String, required: true },
    dificultad: { type: String, enum: ['baja', 'media', 'alta'], default: 'media' },
    nivelRiesgo: { type: Number, required: true },
    esMalicioso: { type: Boolean, default: false },
    estado: { type: String, enum: ['pendiente', 'resuelta', 'ignorada'], default: 'pendiente' },
    fecha: { type: Date, default: Date.now },
    hora: { type: String },
    correo: { type: correoSchema, required: true },
    logs: {
        type: [logSchema],
        validate: [v => v.length > 0, 'El ticket necesita al menos un log de evidencia']
    }
}, { timestamps: true });

// Mientras el ticket esta pendiente, la API no revela la respuesta:
// esMalicioso es el veredicto y nivelRiesgo lo delata. Se muestran
// recien cuando el ticket se resuelve o se ignora.
const CAMPOS_OCULTOS_SI_PENDIENTE = ['esMalicioso', 'nivelRiesgo'];

actividadSchema.set('toJSON', {
    transform: (doc, ret) => {
        if (ret.estado === 'pendiente') {
            CAMPOS_OCULTOS_SI_PENDIENTE.forEach(campo => delete ret[campo]);
        }
        return ret;
    }
});

module.exports = mongoose.models.Actividad || mongoose.model('Actividad', actividadSchema);
