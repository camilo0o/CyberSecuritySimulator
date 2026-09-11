const jwt = require('jsonwebtoken');

function crearTokenJugador(jugadorId) {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET no configurado');
    }

    return jwt.sign(
        { sub: jugadorId.toString() },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
    );
}

module.exports = { crearTokenJugador };