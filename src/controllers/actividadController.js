const {
    listarActividadesPorEmpresa,
    obtenerDetalleActividad,
    resolverActividad
} = require('../services/actividadService');

async function listarPorEmpresa(req, res, next) {
    try {
        const actividades = await listarActividadesPorEmpresa(
            req.params.id,
            req.usuario.id,
            req.query.estado
        );

        res.status(200).json({ actividades });
    } catch (error) {
        next(error);
    }
}

async function obtenerDetalle(req, res, next) {
    try {
        const actividad = await obtenerDetalleActividad(
            req.params.id,
            req.usuario.id
        );

        res.status(200).json(actividad);
    } catch (error) {
        next(error);
    }
}

async function resolver(req, res, next) {
    try { res.status(200).json(await resolverActividad(req.params.id, req.usuario.id, req.body.accion)); }
    catch (error) { next(error); }
}

module.exports = { listarPorEmpresa, obtenerDetalle, resolver };
