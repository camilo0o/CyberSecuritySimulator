const { crearJugador: crearJugadorService } = require('../services/jugadorService');
const { crearTokenJugador } = require('../utils/token');
const { validarCrearJugador, validarRegistro, validarLogin } = require('../validators/jugadorValidator');
const { registrarJugador, validarCredenciales } = require('../services/jugadorService');
const { cerrarSesion: cerrarSesionService } = require('../services/jugadorService');

async function crearJugador(req, res, next) {
    try {
        const validacion = validarCrearJugador(req.body);

        if (!validacion.valido) {
            return res.status(400).json({
                error: validacion.error
            });
        }

        const jugador = await crearJugadorService(req.body.nombre);
        const token = crearTokenJugador(jugador._id, jugador.tokenVersion);

        res.status(201).json({
            jugador,
            token
        });
    } catch (err) {
        next(err);
    }
}

async function registrar(req, res, next) {
    try {
        const validacion = validarRegistro(req.body);
        if (!validacion.valido) return res.status(400).json({ error: validacion.error });

        const jugador = await registrarJugador(req.body);
        const token = crearTokenJugador(jugador._id, jugador.tokenVersion);
        res.status(201).json({ jugador, token });
    } catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    try {
        const validacion = validarLogin(req.body);
        if (!validacion.valido) return res.status(400).json({ error: validacion.error });

        const jugador = await validarCredenciales(req.body.email, req.body.password);
        if (!jugador) return res.status(401).json({ error: 'Credenciales inválidas' });

        const token = crearTokenJugador(jugador._id, jugador.tokenVersion);
        res.status(200).json({ jugador, token });
    } catch (err) {
        next(err);
    }
}

async function logout(req, res, next) {
    try {
        await cerrarSesionService(req.usuario.id);
        res.status(200).json({ mensaje: 'Sesión cerrada' });
    } catch (err) {
        next(err);
    }
}

module.exports = { crearJugador, registrar, login, logout };