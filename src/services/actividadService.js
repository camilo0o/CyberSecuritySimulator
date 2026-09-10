const mongoose = require('mongoose');
const Actividad = require('../models/Actividad');
const Jugador = require('../models/Jugador');
const Empresa = require('../models/Empresa');

const ACCIONES = ['bloquear', 'permitir'];

function limitar(valor, minimo, maximo) { return Math.min(maximo, Math.max(minimo, valor)); }

function evaluarImpacto(actividad, accion, empresa) {
    const riesgo = actividad.nivelRiesgo;
    const esMaliciosa = actividad.esMalicioso === true || riesgo >= 60;
    const correcta = (esMaliciosa && accion === 'bloquear') || (!esMaliciosa && accion === 'permitir');
    const impacto = { seguridad: 0, reputacion: 0, dinero: 0 };

    if (correcta && accion === 'bloquear') {
        impacto.seguridad = riesgo;
        impacto.reputacion = Math.floor(riesgo / 2);
        impacto.dinero = -riesgo * 2;
    } else if (correcta) {
        impacto.reputacion = 2;
        impacto.dinero = riesgo;
    } else if (accion === 'bloquear') {
        impacto.seguridad = -Math.floor(riesgo / 2);
        impacto.reputacion = -riesgo;
        impacto.dinero = -riesgo * 5;
    } else {
        impacto.seguridad = -riesgo;
        impacto.reputacion = -riesgo;
        impacto.dinero = -riesgo * 10;
    }

    return {
        correcta,
        esMaliciosa,
        impacto,
        valoresEmpresa: {
            seguridad: limitar(empresa.seguridad + impacto.seguridad, 0, 100),
            reputacion: limitar(empresa.reputacion + impacto.reputacion, 0, 100),
            dinero: Math.max(0, empresa.dinero + impacto.dinero),
        },
    };
}

async function resolverActividad(actividadId, jugadorId, accion) {
    if (!ACCIONES.includes(accion)) { const error = new Error('La accion debe ser bloquear o permitir'); error.statusCode = 400; throw error; }
    if (!mongoose.isValidObjectId(actividadId) || !mongoose.isValidObjectId(jugadorId)) { const error = new Error('Identificador invalido'); error.statusCode = 400; throw error; }
    const session = await mongoose.startSession();
    try {
        let resultado;
        await session.withTransaction(async () => {
            const actividad = await Actividad.findOne({ _id: actividadId, jugadorId }).session(session);
            if (!actividad) { const error = new Error('Actividad no encontrada'); error.statusCode = 404; throw error; }
            if (actividad.estado !== 'pendiente') { const error = new Error('La actividad ya fue resuelta'); error.statusCode = 409; throw error; }
            const jugador = await Jugador.findById(jugadorId).session(session);
            if (!jugador || !jugador.empresaId) { const error = new Error('El jugador no tiene una empresa asociada'); error.statusCode = 404; throw error; }
            const empresa = await Empresa.findById(jugador.empresaId).session(session);
            if (!empresa) { const error = new Error('Empresa no encontrada'); error.statusCode = 404; throw error; }
            const evaluacion = evaluarImpacto(actividad, accion, empresa);
            actividad.estado = 'resuelta';
            await actividad.save({ session });
            Object.assign(empresa, evaluacion.valoresEmpresa);
            await empresa.save({ session });
            resultado = { actividad: actividad.toObject(), empresa: empresa.toObject(), correcta: evaluacion.correcta, esMaliciosa: evaluacion.esMaliciosa, impacto: evaluacion.impacto };
        });
        return resultado;
    } finally { await session.endSession(); }
}

module.exports = { resolverActividad, evaluarImpacto, ACCIONES };
