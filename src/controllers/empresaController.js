const { validarCrearEmpresa } = require('../validators/empresaValidator');
const { iniciarPartida, obtenerEstado } = require('../services/empresaService');

async function crearEmpresa(req, res, next) {
    try {
        const validacion = validarCrearEmpresa(req.body);
        if (!validacion.valido) {
            return res.status(400).json({ error: validacion.error });
        }

        const empresa = await iniciarPartida(req.body.jugadorId);
        res.status(201).json(empresa);
    } catch (err) {
        next(err);
    }
}

async function obtenerEstadoEmpresa(req, res, next) {
    try {
        const empresa = await obtenerEstado(req.params.id);
        res.status(200).json(empresa);
    } catch (err) {
        next(err);
    }
}

module.exports = { crearEmpresa, obtenerEstadoEmpresa };