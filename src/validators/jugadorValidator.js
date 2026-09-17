function validarCrearJugador(data) {
    const { nombre } = data;
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        return { valido: false, error: 'El nombre es requerido y debe ser un texto válido' };
    }
    return { valido: true };
}

function validarRegistro({ nombre, email, password }) {
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        return { valido: false, error: 'El nombre es requerido' };
    }
    if (!email || !email.includes('@')) {
        return { valido: false, error: 'Email inválido' };
    }
    if (!password || password.length < 6) {
        return { valido: false, error: 'La contraseña debe tener al menos 6 caracteres' };
    }
    return { valido: true };
}

function validarLogin({ email, password }) {
    if (!email || !password) {
        return { valido: false, error: 'Email y contraseña son requeridos' };
    }
    return { valido: true };
}

module.exports = { validarCrearJugador, validarRegistro, validarLogin };