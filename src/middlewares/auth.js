const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
    const encabezado = req.headers.authorization;
    const [esquema, token] = encabezado ? encabezado.split(' ') : [];

    if (esquema !== 'Bearer' || !token) {
        return res.status(401).json({
            error: 'Token de autenticacion requerido'
        });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        if (!payload.sub) {
            return res.status(401).json({
                error: 'El token no identifica al jugador'
            });
        }

        req.usuario = {
            id: payload.sub
        };

        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Token invalido o expirado'
        });
    }
}

module.exports = { autenticar };