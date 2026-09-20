const Actividad = require('../models/Actividad');

const ACTIVIDADES_BASE = [
    {
        tipo: 'email',
        descripcion: 'Correo sospechoso recibido',
        dificultad: 'media',
        nivelRiesgo: 40,
        esMalicioso: true,
        titulo: 'Alerta de inicio de sesion',
        remitente: 'seguridad@micros0ft-alertas.com',
        destinatario: 'mario@secureway.com',
        contenido: 'Detectamos un inicio de sesion inusual. Verifica tu cuenta desde el enlace.',
        tieneAdjunto: false,
        enlace: 'https://secureway-verificacion.com/login'
    },
    {
        tipo: 'logs',
        descripcion: 'Actividad inusual detectada en los logs',
        dificultad: 'alta',
        nivelRiesgo: 70,
        esMalicioso: true,
        contenido: 'Inicio de sesion detectado desde un dispositivo no reconocido',
        direccionIp: '185.220.101.42',
        ubicacion: 'Bucarest, Rumania',
        dispositivo: 'Windows 11 - Chrome',
        usuario: 'mario',
        tipoAcceso: 'Inicio de sesion remoto'
    }
];

async function sembrarActividadesDelTurno(jugadorId, turno, options = {}) {
    const actividades = ACTIVIDADES_BASE.map((actividad) => ({
        ...actividad,
        jugadorId,
        turno,
        estado: 'pendiente'
    }));

    return Actividad.insertMany(actividades, options);
}

module.exports = { sembrarActividadesDelTurno };