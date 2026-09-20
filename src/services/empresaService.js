const mongoose = require('mongoose');
const Jugador = require('../models/Jugador');
const Empresa = require('../models/Empresa');
const Actividad = require('../models/Actividad');
const { crearHistorial } = require('./historialService');
const { generarActividadesDeTurno } = require('../data/databaseSeeder');

function limitar(valor, minimo, maximo) {
    return Math.min(maximo, Math.max(minimo, valor));
}

function penalizarPendiente(actividad, empresa) {
    const riesgo = actividad.nivelRiesgo;

    return {
        seguridad: limitar(empresa.seguridad - riesgo, 0, 100),
        reputacion: limitar(empresa.reputacion - riesgo, 0, 100),
        dinero: Math.max(0, empresa.dinero - riesgo * 5)
    };
}

function partidaFinalizada(empresa) {
    return (
        empresa.seguridad <= 0 ||
        empresa.reputacion <= 0 ||
        empresa.dinero <= 0
    );
}

function crearProximasActividades(empresaId, jugadorId, turno) {
    return generarActividadesDeTurno(empresaId, jugadorId, turno, 1); // 1 ticket por turno
}

async function avanzarTurno(empresaId, jugadorId) {
    if (
        !mongoose.isValidObjectId(empresaId) ||
        !mongoose.isValidObjectId(jugadorId)
    ) {
        const error = new Error('Identificador invalido');
        error.statusCode = 400;
        throw error;
    }

    const session = await mongoose.startSession();

    try {
        let resultado;

        await session.withTransaction(async () => {
            const jugador = await Jugador.findOne({
                _id: jugadorId,
                empresaId
            }).session(session);

            if (!jugador) {
                const error = new Error('Empresa no encontrada');
                error.statusCode = 404;
                throw error;
            }

            const empresa = await Empresa.findById(empresaId).session(session);

            if (!empresa) {
                const error = new Error('Empresa no encontrada');
                error.statusCode = 404;
                throw error;
            }

            if (empresa.estado !== 'activa') {
                const error = new Error('La partida ya finalizo');
                error.statusCode = 409;
                throw error;
            }

            const pendientes = await Actividad.find({
                empresaId,
                jugadorId,
                turno: empresa.turno,
                estado: 'pendiente'
            }).session(session);

            for (const actividad of pendientes) {
                Object.assign(
                    empresa,
                    penalizarPendiente(actividad, empresa)
                );

                actividad.estado = 'ignorada';
                await actividad.save({ session });
            }

            empresa.turno += 1;

            const perdio = partidaFinalizada(empresa);
            const gano = !perdio && empresa.turno > empresa.maxTurnos;

            if (perdio) {
                empresa.estado = 'derrota';
            } else if (gano) {
                empresa.estado = 'victoria';
            }

            await empresa.save({ session });

            let nuevasActividades = [];

            if (empresa.estado === 'activa') {
                nuevasActividades = await Actividad.insertMany(
                    await crearProximasActividades(empresaId, jugadorId, empresa.turno),
                    { session }
                );
            } else {
                await crearHistorial({
                    jugadorId,
                    empresaId,
                    nombreJugador: jugador.nombre,
                    seguridadFinal: empresa.seguridad,
                    reputacionFinal: empresa.reputacion,
                    dineroFinal: empresa.dinero
                }, session);
            }

            resultado = {
                empresa: empresa.toObject(),
                actividades: nuevasActividades.map(
                    actividad => actividad.toObject()
                ),
                pendientesPenalizadas: pendientes.length
            };
        });

        return resultado;
    } finally {
        await session.endSession();
    }
}

async function rendirse(empresaId, jugadorId) {
    if (
        !mongoose.isValidObjectId(empresaId) ||
        !mongoose.isValidObjectId(jugadorId)
    ) {
        const error = new Error('Identificador invalido');
        error.statusCode = 400;
        throw error;
    }

    const session = await mongoose.startSession();

    try {
        let resultado;

        await session.withTransaction(async () => {
            const jugador = await Jugador.findOne({
                _id: jugadorId,
                empresaId
            }).session(session);

            if (!jugador) {
                const error = new Error('Empresa no encontrada');
                error.statusCode = 404;
                throw error;
            }

            const empresa = await Empresa.findById(empresaId).session(session);

            if (!empresa) {
                const error = new Error('Empresa no encontrada');
                error.statusCode = 404;
                throw error;
            }

            if (empresa.estado !== 'activa') {
                const error = new Error('La partida ya finalizo');
                error.statusCode = 409;
                throw error;
            }

            empresa.estado = 'derrota';
            await empresa.save({ session });

            await crearHistorial({
                jugadorId,
                empresaId,
                nombreJugador: jugador.nombre,
                seguridadFinal: empresa.seguridad,
                reputacionFinal: empresa.reputacion,
                dineroFinal: empresa.dinero
            }, session);

            resultado = { empresa: empresa.toObject() };
        });

        return resultado;
    } finally {
        await session.endSession();
    }
}

async function iniciarPartida(jugadorId) {
    const jugador = await Jugador.findById(jugadorId);
    if (!jugador) {
        const error = new Error('Jugador no encontrado');
        error.statusCode = 404;
        throw error;
    }

    const empresa = await Empresa.create({});

    jugador.empresaId = empresa._id;
    await jugador.save();

    await Actividad.insertMany(
        await crearProximasActividades(empresa._id, jugadorId, empresa.turno)
    );

    return empresa;
}

async function obtenerEstado(empresaId, jugadorId) {
    const jugador = await Jugador.findOne({
        _id: jugadorId,
        empresaId
    });

    if (!jugador) {
        const error = new Error('Empresa no encontrada');
        error.statusCode = 404;
        throw error;
    }

    const empresa = await Empresa.findById(empresaId);

    if (!empresa) {
        const error = new Error('Empresa no encontrada');
        error.statusCode = 404;
        throw error;
    }

    return empresa;
}

module.exports = { iniciarPartida, obtenerEstado, avanzarTurno, rendirse };