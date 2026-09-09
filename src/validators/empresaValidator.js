function validarCrearEmpresa(data) {
    const { jugadorId } = data;
    if (!jugadorId) {
        return { valido: false, error: 'El jugadorId es requerido' };
    }
    return { valido: true };
}

module.exports = { validarCrearEmpresa };