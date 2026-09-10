const { resolverActividad } = require('../services/actividadService');

async function resolver(req, res, next) {
    try { res.status(200).json(await resolverActividad(req.params.id, req.usuario.id, req.body.accion)); }
    catch (error) { next(error); }
}

module.exports = { resolver };
