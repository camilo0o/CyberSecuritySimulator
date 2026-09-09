function validarCrearJugador(data) {
    const { nombre } = data;
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        return { valido: false, error: 'El nombre es requerido y debe ser un texto válido' };
    }
    return { valido: true };
}

module.exports = { validarCrearJugador };