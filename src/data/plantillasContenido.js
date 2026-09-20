// Banco de tickets del juego.
// Cada ticket es un correo reportado (correo) mas la evidencia que el jugador
// puede investigar desde la consola (logs). La idea es que el correo solo no
// alcance para decidir: la respuesta real esta en los logs.
//
// archivo: mail.log (gateway de correo), auth.log (inicios de sesion),
//          proxy.log (navegacion web), sandbox.log (analisis de adjuntos)

const BANCO_TICKETS = [
    // ---------- Maliciosos ----------
    {
        descripcion: 'Correo de restablecimiento de contrasena con enlace externo',
        dificultad: 'media',
        nivelRiesgo: 75,
        esMalicioso: true,
        correo: {
            titulo: 'Tu contrasena ha expirado',
            remitente: 'soporte@segur1dad-corp.com',
            destinatario: 'cfernandez@empresa.com',
            contenido: 'Detectamos actividad inusual en tu cuenta. Ingresa ahora para evitar el bloqueo permanente.',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: 'https://segur1dad-corp.com/reset'
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '08:41:12',
                contenido: 'mx01 postfix/smtpd: from=<soporte@segur1dad-corp.com> to=<cfernandez@empresa.com> ip=185.220.101.7 spf=FAIL dkim=none dmarc=FAIL',
                direccionIp: '185.220.101.7',
                ubicacion: 'Moscu, Rusia',
                usuario: 'cfernandez',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'proxy.log',
                hora: '08:43:05',
                contenido: 'proxy01 GET https://segur1dad-corp.com/reset user=cfernandez categoria=sin-clasificar dominio_creado=hace-3-dias',
                direccionIp: '10.0.0.37',
                ubicacion: 'Red corporativa',
                dispositivo: 'Windows - Chrome',
                usuario: 'cfernandez',
                tipoAcceso: 'http'
            },
            {
                archivo: 'auth.log',
                hora: '08:52:40',
                contenido: 'srv-ad01 auth: Accepted password for cfernandez from 185.220.101.7 geo=Moscu,RU dispositivo=nuevo',
                direccionIp: '185.220.101.7',
                ubicacion: 'Moscu, Rusia',
                dispositivo: 'Linux - Chrome',
                usuario: 'cfernandez',
                tipoAcceso: 'vpn'
            }
        ]
    },
    {
        descripcion: 'Factura con adjunto ejecutable disfrazado de PDF',
        dificultad: 'alta',
        nivelRiesgo: 90,
        esMalicioso: true,
        correo: {
            titulo: 'Factura pendiente de pago #4471',
            remitente: 'facturacion@proveedor-logistico.net',
            destinatario: 'contabilidad@empresa.com',
            contenido: 'Adjuntamos la factura vencida. Por favor procesa el pago antes del viernes.',
            tieneAdjunto: true,
            nombreAdjunto: 'Factura_4471.pdf',
            enlace: ''
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '10:02:33',
                contenido: 'mx01 postfix/smtpd: from=<facturacion@proveedor-logistico.net> ip=45.95.147.12 spf=PASS dkim=none primer_contacto=SI',
                direccionIp: '45.95.147.12',
                ubicacion: 'Amsterdam, Paises Bajos',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'sandbox.log',
                hora: '10:02:51',
                contenido: 'sandbox01 analisis: Factura_4471.pdf tipo_real=PE32 ejecutable extension_doble=.pdf.exe veredicto=MALICIOSO familia=AgentTesla',
                tipoAcceso: 'analisis-adjunto'
            }
        ]
    },
    {
        descripcion: 'Suplantacion del gerente general pidiendo una transferencia urgente',
        dificultad: 'alta',
        nivelRiesgo: 85,
        esMalicioso: true,
        correo: {
            titulo: 'Necesito que hagas esto de inmediato',
            remitente: 'gerencia.general@empresa-corp.co',
            destinatario: 'finanzas@empresa.com',
            contenido: 'Estoy en una reunion y no puedo hablar, necesito que transfieras 8.000 USD a este proveedor ahora. No lo comentes con nadie.',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: ''
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '15:17:09',
                contenido: 'mx01 postfix/smtpd: from=<gerencia.general@empresa-corp.co> reply-to=<gerente.pagos2024@gmail.com> ip=102.89.34.11 spf=FAIL dmarc=FAIL',
                direccionIp: '102.89.34.11',
                ubicacion: 'Lagos, Nigeria',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'auth.log',
                hora: '15:10:44',
                contenido: 'srv-ad01 auth: Accepted password for rgarcia (gerencia) from 10.0.0.8 geo=Paysandu,UY dispositivo=registrado sala=directorio',
                direccionIp: '10.0.0.8',
                ubicacion: 'Oficina central',
                dispositivo: 'MacOS - Safari',
                usuario: 'rgarcia',
                tipoAcceso: 'portal-web'
            }
        ]
    },
    {
        descripcion: 'Phishing que simula el portal de recursos humanos',
        dificultad: 'media',
        nivelRiesgo: 65,
        esMalicioso: true,
        correo: {
            titulo: 'Actualiza tus datos bancarios para la nomina',
            remitente: 'rrhh@empresa-nomina.info',
            destinatario: 'todos@empresa.com',
            contenido: 'Debido a un cambio de plataforma, actualiza tus datos bancarios antes del cierre de nomina.',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: 'http://empresa-nomina.info/actualizar-datos'
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '09:30:02',
                contenido: 'mx01 postfix/smtpd: from=<rrhh@empresa-nomina.info> ip=194.26.29.40 spf=SOFTFAIL destinatarios=148',
                direccionIp: '194.26.29.40',
                ubicacion: 'Exterior',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'proxy.log',
                hora: '09:34:18',
                contenido: 'proxy01 POST http://empresa-nomina.info/actualizar-datos user=apereira categoria=phishing dominio_creado=hace-2-dias certificado=ninguno',
                direccionIp: '10.0.0.21',
                ubicacion: 'Red corporativa',
                dispositivo: 'Windows - Chrome',
                usuario: 'apereira',
                tipoAcceso: 'http'
            }
        ]
    },
    {
        descripcion: 'Planilla con macro maliciosa enviada por un supuesto socio',
        dificultad: 'alta',
        nivelRiesgo: 80,
        esMalicioso: true,
        correo: {
            titulo: 'Reporte de ventas del trimestre',
            remitente: 'ventas.regional@empresa-partner.biz',
            destinatario: 'gerente.ventas@empresa.com',
            contenido: 'Aqui esta el reporte que pediste, habilita el contenido para ver los graficos.',
            tieneAdjunto: true,
            nombreAdjunto: 'Reporte_Q3.xlsm',
            enlace: ''
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '11:48:27',
                contenido: 'mx01 postfix/smtpd: from=<ventas.regional@empresa-partner.biz> ip=91.219.237.100 spf=PASS dkim=none primer_contacto=SI',
                direccionIp: '91.219.237.100',
                ubicacion: 'Exterior',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'sandbox.log',
                hora: '11:48:40',
                contenido: 'sandbox01 analisis: Reporte_Q3.xlsm macro=AutoOpen ejecuta=powershell.exe -enc JABjAD0A... conexion=91.219.237.100:443 veredicto=MALICIOSO',
                tipoAcceso: 'analisis-adjunto'
            }
        ]
    },
    {
        descripcion: 'Falso soporte tecnico con enlace acortado a un ejecutable',
        dificultad: 'media',
        nivelRiesgo: 55,
        esMalicioso: true,
        correo: {
            titulo: 'Tu equipo requiere una actualizacion de seguridad urgente',
            remitente: 'it-support@empresa-updates.com',
            destinatario: 'lrodriguez@empresa.com',
            contenido: 'Se detecto una vulnerabilidad en tu equipo, descarga el parche desde el siguiente enlace.',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: 'https://bit.ly/3xUpdt3'
        },
        logs: [
            {
                archivo: 'proxy.log',
                hora: '14:05:51',
                contenido: 'proxy01 GET https://bit.ly/3xUpdt3 -> 301 http://cdn-files-update.xyz/parche_seguridad.exe user=lrodriguez',
                direccionIp: '10.0.0.44',
                ubicacion: 'Red corporativa',
                dispositivo: 'Windows - Edge',
                usuario: 'lrodriguez',
                tipoAcceso: 'http'
            },
            {
                archivo: 'mail.log',
                hora: '14:01:13',
                contenido: 'mx01 postfix/smtpd: from=<it-support@empresa-updates.com> ip=203.0.113.55 spf=FAIL nota=el-soporte-real-usa-soporte_it@empresa.com',
                direccionIp: '203.0.113.55',
                ubicacion: 'Desconocida',
                tipoAcceso: 'smtp'
            }
        ]
    },
    {
        descripcion: 'Correo que parece de una companera pero viene de afuera',
        dificultad: 'alta',
        nivelRiesgo: 70,
        esMalicioso: true,
        correo: {
            titulo: 'Te comparti un documento',
            remitente: 'maria.gomez@empresa.com',
            destinatario: 'nmartinez@empresa.com',
            contenido: 'Hola! Te comparti el documento del proyecto, revisalo cuando puedas y dejame tus comentarios.',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: 'https://empresa-sharepoint.com/doc/proyecto'
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '16:22:40',
                contenido: 'mx01 postfix/smtpd: from=<maria.gomez@empresa.com> ip=185.100.87.202 spf=FAIL dkim=FAIL relay=externo (los correos internos salen por 10.0.0.2)',
                direccionIp: '185.100.87.202',
                ubicacion: 'Exterior (nodo Tor)',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'auth.log',
                hora: '16:20:05',
                contenido: 'srv-ad01 auth: maria.gomez sin sesiones activas, estado=vacaciones hasta el lunes',
                usuario: 'maria.gomez',
                tipoAcceso: 'directorio'
            }
        ]
    },
    {
        descripcion: 'Premio falso de un sorteo internacional',
        dificultad: 'baja',
        nivelRiesgo: 45,
        esMalicioso: true,
        correo: {
            titulo: 'Has sido seleccionado como ganador',
            remitente: 'premios@sorteo-internacional.com',
            destinatario: 'dvargas@empresa.com',
            contenido: 'Felicidades, ganaste un premio de 5000 USD. Haz clic para reclamarlo antes de que expire.',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: 'https://sorteo-internacional.com/reclamar'
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '07:55:18',
                contenido: 'mx01 postfix/smtpd: from=<premios@sorteo-internacional.com> ip=41.203.72.19 spf=NONE spam_score=8.7',
                direccionIp: '41.203.72.19',
                ubicacion: 'Lagos, Nigeria',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'proxy.log',
                hora: '07:58:02',
                contenido: 'proxy01 GET https://sorteo-internacional.com/reclamar user=dvargas categoria=fraude bloqueado=NO',
                direccionIp: '10.0.0.33',
                ubicacion: 'Red corporativa',
                dispositivo: 'MacOS - Safari',
                usuario: 'dvargas',
                tipoAcceso: 'http'
            }
        ]
    },

    // ---------- Legitimos ----------
    {
        descripcion: 'Correo real de una companera confirmando una reunion',
        dificultad: 'baja',
        nivelRiesgo: 5,
        esMalicioso: false,
        correo: {
            titulo: 'Confirmacion reunion de equipo del jueves',
            remitente: 'maria.gomez@empresa.com',
            destinatario: 'equipo.desarrollo@empresa.com',
            contenido: 'Hola equipo, confirmo la reunion del jueves a las 10am para revisar el sprint.',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: ''
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '09:12:03',
                contenido: 'mx01 postfix/smtpd: from=<maria.gomez@empresa.com> ip=10.0.0.2 relay=interno spf=PASS dkim=PASS',
                direccionIp: '10.0.0.2',
                ubicacion: 'Red corporativa',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'auth.log',
                hora: '08:47:31',
                contenido: 'srv-ad01 auth: Accepted password for maria.gomez from 10.0.0.19 geo=Paysandu,UY dispositivo=registrado',
                direccionIp: '10.0.0.19',
                ubicacion: 'Oficina central',
                dispositivo: 'Windows - Outlook',
                usuario: 'maria.gomez',
                tipoAcceso: 'portal-web'
            }
        ]
    },
    {
        descripcion: 'Factura real del proveedor de hosting',
        dificultad: 'media',
        nivelRiesgo: 10,
        esMalicioso: false,
        correo: {
            titulo: 'Factura de servicios de hosting - Octubre',
            remitente: 'facturacion@hostingcloud.com',
            destinatario: 'contabilidad@empresa.com',
            contenido: 'Adjuntamos la factura correspondiente al mes de octubre por los servicios contratados.',
            tieneAdjunto: true,
            nombreAdjunto: 'Factura_Octubre.pdf',
            enlace: ''
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '06:30:44',
                contenido: 'mx01 postfix/smtpd: from=<facturacion@hostingcloud.com> ip=52.14.88.10 spf=PASS dkim=PASS dmarc=PASS historial=12-meses',
                direccionIp: '52.14.88.10',
                ubicacion: 'Estados Unidos',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'sandbox.log',
                hora: '06:30:59',
                contenido: 'sandbox01 analisis: Factura_Octubre.pdf tipo_real=PDF macros=0 enlaces=0 veredicto=LIMPIO',
                tipoAcceso: 'analisis-adjunto'
            }
        ]
    },
    {
        descripcion: 'Boletin interno mensual de comunicaciones',
        dificultad: 'baja',
        nivelRiesgo: 0,
        esMalicioso: false,
        correo: {
            titulo: 'Boletin interno - Novedades del mes',
            remitente: 'comunicaciones@empresa.com',
            destinatario: 'todos@empresa.com',
            contenido: 'Estas son las novedades de este mes: nuevos beneficios, cumpleanos y logros del equipo.',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: 'https://intranet.empresa.com/boletin'
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '09:00:00',
                contenido: 'mx01 postfix/smtpd: from=<comunicaciones@empresa.com> ip=10.0.0.2 relay=interno spf=PASS dkim=PASS destinatarios=148',
                direccionIp: '10.0.0.2',
                ubicacion: 'Red corporativa',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'proxy.log',
                hora: '09:06:27',
                contenido: 'proxy01 GET https://intranet.empresa.com/boletin user=apereira categoria=corporativo',
                direccionIp: '10.0.0.21',
                ubicacion: 'Red corporativa',
                usuario: 'apereira',
                tipoAcceso: 'http'
            }
        ]
    },
    {
        descripcion: 'Presentacion real compartida por un colega',
        dificultad: 'media',
        nivelRiesgo: 5,
        esMalicioso: false,
        correo: {
            titulo: 'Presentacion para la reunion de manana',
            remitente: 'juan.perez@empresa.com',
            destinatario: 'equipo.marketing@empresa.com',
            contenido: 'Les comparto la presentacion final para la reunion de manana, cualquier ajuste avisenme.',
            tieneAdjunto: true,
            nombreAdjunto: 'Presentacion_Marketing.pptx',
            enlace: ''
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '17:40:10',
                contenido: 'mx01 postfix/smtpd: from=<juan.perez@empresa.com> ip=10.0.0.2 relay=interno spf=PASS dkim=PASS',
                direccionIp: '10.0.0.2',
                ubicacion: 'Red corporativa',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'sandbox.log',
                hora: '17:40:22',
                contenido: 'sandbox01 analisis: Presentacion_Marketing.pptx tipo_real=PPTX macros=0 veredicto=LIMPIO',
                tipoAcceso: 'analisis-adjunto'
            }
        ]
    },
    {
        descripcion: 'Aviso alarmante de nuevo dispositivo que en realidad es legitimo',
        dificultad: 'alta',
        nivelRiesgo: 40,
        esMalicioso: false,
        correo: {
            titulo: 'ALERTA: inicio de sesion desde un dispositivo nuevo',
            remitente: 'seguridad@empresa.com',
            destinatario: 'nmartinez@empresa.com',
            contenido: 'Detectamos un inicio de sesion en tu cuenta desde un iPhone nuevo. Si no fuiste vos, contacta a soporte de inmediato.',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: 'https://portal.empresa.com/seguridad'
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '12:15:36',
                contenido: 'mx01 postfix/smtpd: from=<seguridad@empresa.com> ip=10.0.0.2 relay=interno spf=PASS dkim=PASS',
                direccionIp: '10.0.0.2',
                ubicacion: 'Red corporativa',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'auth.log',
                hora: '12:14:58',
                contenido: 'srv-ad01 auth: Accepted password+MFA for nmartinez from 192.168.1.14 geo=Paysandu,UY dispositivo=nuevo registrado_por=soporte_it ticket=#2291',
                direccionIp: '192.168.1.14',
                ubicacion: 'Red corporativa (WiFi)',
                dispositivo: 'iPhone - App corporativa',
                usuario: 'nmartinez',
                tipoAcceso: 'mobile'
            }
        ]
    },
    {
        descripcion: 'Recordatorio de vencimiento de contrasena del sistema interno',
        dificultad: 'alta',
        nivelRiesgo: 35,
        esMalicioso: false,
        correo: {
            titulo: 'Tu contrasena vence en 3 dias',
            remitente: 'no-reply@empresa.com',
            destinatario: 'lrodriguez@empresa.com',
            contenido: 'Por politica de seguridad, tu contrasena vence en 3 dias. Cambiala desde el portal para no perder el acceso.',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: 'https://portal.empresa.com/cambiar-contrasena'
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '06:00:01',
                contenido: 'mx01 postfix/smtpd: from=<no-reply@empresa.com> ip=10.0.0.2 relay=interno spf=PASS dkim=PASS origen=tarea-programada',
                direccionIp: '10.0.0.2',
                ubicacion: 'Red corporativa',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'proxy.log',
                hora: '09:21:47',
                contenido: 'proxy01 GET https://portal.empresa.com/cambiar-contrasena user=lrodriguez categoria=corporativo certificado=valido',
                direccionIp: '10.0.0.44',
                ubicacion: 'Red corporativa',
                usuario: 'lrodriguez',
                tipoAcceso: 'http'
            }
        ]
    }
];

module.exports = { BANCO_TICKETS };
