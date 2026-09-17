const bcrypt = require('bcryptjs');
const Jugador = require('../models/Jugador');

async function registrarJugador({ nombre, email, password }) {
    const existente = await Jugador.findOne({ email });
    if (existente) {
        const error = new Error('Ya existe un jugador con ese email');
        error.statusCode = 409;
        throw error;
    }
    const passwordHasheada = await bcrypt.hash(password, 12);
    return await Jugador.create({ nombre, email, password: passwordHasheada });
}

async function validarCredenciales(email, password) {
    const jugador = await Jugador.findOne({ email });
    if (!jugador) return null;
    const coincide = await bcrypt.compare(password, jugador.password);
    return coincide ? jugador : null;
}

async function cerrarSesion(jugadorId) {
    await Jugador.findByIdAndUpdate(jugadorId, { $inc: { tokenVersion: 1 } });
}

module.exports = { registrarJugador, validarCredenciales, cerrarSesion };