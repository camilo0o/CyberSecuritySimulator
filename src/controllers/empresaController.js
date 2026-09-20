const { iniciarPartida, obtenerEstado, avanzarTurno, rendirse } = require('../services/empresaService');

async function crearEmpresa(req, res, next) {
    try {
        const empresa = await iniciarPartida(req.usuario.id);
        res.status(201).json(empresa);
    } catch (err) {
        next(err);
    }
}

async function obtenerEstadoEmpresa(req, res, next) {
    try {
        const empresa = await obtenerEstado(
            req.params.id,
            req.usuario.id
        );

        res.status(200).json(empresa);
    } catch (err) {
        next(err);
    }
}

async function avanzar(req, res, next) {
    try {
        const resultado = await avanzarTurno(
            req.params.id,
            req.usuario.id
        );

        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
}

async function rendirseController(req, res, next) {
    try {
        const resultado = await rendirse(
            req.params.id,
            req.usuario.id
        );

        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
}

module.exports = { crearEmpresa, obtenerEstadoEmpresa, avanzar, rendirse: rendirseController };