const mongoose = require('mongoose');
const Actividad = require('../models/Actividad');
const Jugador = require('../models/Jugador');
const Empresa = require('../models/Empresa');

const ACCIONES = ['bloquear', 'permitir'];
const ESTADOS = ['pendiente', 'resuelta', 'ignorada'];

function crearError(mensaje, statusCode) {
    const error = new Error(mensaje);
    error.statusCode = statusCode;
    return error;
}

function limitar(valor, minimo, maximo) { return Math.min(maximo, Math.max(minimo, valor)); }

async function validarEmpresaDelJugador(empresaId, jugadorId) {
    if (!mongoose.isValidObjectId(empresaId) || !mongoose.isValidObjectId(jugadorId)) {
        throw crearError('Identificador invalido', 400);
    }

    const jugador = await Jugador.findOne({ _id: jugadorId, empresaId });

    if (!jugador) {
        throw crearError('Empresa no encontrada', 404);
    }

    const empresa = await Empresa.findById(empresaId);

    if (!empresa) {
        throw crearError('Empresa no encontrada', 404);
    }

    return { jugador, empresa };
}

async function listarActividadesPorEmpresa(empresaId, jugadorId, estado) {
    await validarEmpresaDelJugador(empresaId, jugadorId);

    if (estado && !ESTADOS.includes(estado)) {
        throw crearError('Estado de actividad invalido', 400);
    }

    const filtro = { jugadorId };

    if (estado) {
        filtro.estado = estado;
    }

    return await Actividad.find(filtro)
        .sort({ turno: 1, fecha: 1, _id: 1 });
}

async function obtenerDetalleActividad(actividadId, jugadorId) {
    if (!mongoose.isValidObjectId(actividadId) || !mongoose.isValidObjectId(jugadorId)) {
        throw crearError('Identificador invalido', 400);
    }

    const actividad = await Actividad.findOne({
        _id: actividadId,
        jugadorId
    });

    if (!actividad) {
        throw crearError('Actividad no encontrada', 404);
    }

    return actividad;
}

function evaluarImpacto(actividad, accion, empresa) {
    const riesgo = actividad.nivelRiesgo;
    // Solo decide esMalicioso: un ticket alarmante pero legitimo no debe contar como amenaza
    const esMaliciosa = actividad.esMalicioso === true;
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
    if (!ACCIONES.includes(accion)) { throw crearError('La accion debe ser bloquear o permitir', 400); }
    if (!mongoose.isValidObjectId(actividadId) || !mongoose.isValidObjectId(jugadorId)) { throw crearError('Identificador invalido', 400); }
    const session = await mongoose.startSession();
    try {
        let resultado;
        await session.withTransaction(async () => {
            const actividad = await Actividad.findOne({ _id: actividadId, jugadorId }).session(session);
            if (!actividad) { throw crearError('Actividad no encontrada', 404); }
            if (actividad.estado !== 'pendiente') { throw crearError('La actividad ya fue resuelta', 409); }
            const jugador = await Jugador.findById(jugadorId).session(session);
            if (!jugador || !jugador.empresaId) { throw crearError('El jugador no tiene una empresa asociada', 404); }
            const empresa = await Empresa.findById(jugador.empresaId).session(session);
            if (!empresa) { throw crearError('Empresa no encontrada', 404); }
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

module.exports = {
    listarActividadesPorEmpresa,
    obtenerDetalleActividad,
    resolverActividad,
    evaluarImpacto,
    ACCIONES,
    ESTADOS
};
