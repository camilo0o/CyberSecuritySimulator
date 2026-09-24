// Banco de tickets del juego.
// Cada ticket es un correo reportado (correo) mas la evidencia que el jugador
// puede investigar desde la consola (logs). La idea es que el correo solo no
// alcance para decidir: la respuesta real esta en los logs.
//
// archivo: mail.log (gateway de correo), auth.log (inicios de sesion),
//          proxy.log (navegacion web), sandbox.log (analisis de adjuntos)
//
// El texto de "contenido" en cada log esta escrito en espanol simple, para
// que se entienda sin ser experto en ciberseguridad (no hace falta saber
// leer sintaxis de syslog real). Los datos tecnicos puntuales (IP, usuario,
// dispositivo, ubicacion) quedan en sus propios campos.

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
            contenido: 'Hola,\n\nDetectamos actividad inusual en tu cuenta corporativa durante las ultimas horas. Por tu seguridad, limitamos temporalmente el acceso hasta que confirmes tu identidad.\n\nPara evitar que tu cuenta quede bloqueada de forma permanente, ingresa al siguiente enlace y verifica tus datos antes de las proximas 24 horas.\n\nSi no reconoces esta actividad, te recomendamos cambiar tu contrasena de inmediato desde el portal oficial.\n\nEquipo de Soporte',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: 'https://segur1dad-corp.com/reset'
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '08:41:12',
                contenido: 'Llego un correo de soporte@segur1dad-corp.com. La verificacion de origen (SPF) fallo, y tambien fallaron DKIM y DMARC: son tres controles que confirman si el servidor que mando el correo tiene permiso para usar ese dominio, y los tres dieron mal.',
                direccionIp: '185.220.101.7',
                ubicacion: 'Moscu, Rusia',
                usuario: 'cfernandez',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'proxy.log',
                hora: '08:43:05',
                contenido: 'Alguien de la red interna (cfernandez) entro al enlace del correo. El sitio todavia no tiene una categoria conocida y el dominio se registro hace solo 3 dias: un dominio tan nuevo es una senal tipica de phishing.',
                direccionIp: '10.0.0.37',
                ubicacion: 'Red corporativa',
                dispositivo: 'Windows - Chrome',
                usuario: 'cfernandez',
                tipoAcceso: 'http'
            },
            {
                archivo: 'auth.log',
                hora: '08:52:40',
                contenido: 'Se registro un inicio de sesion exitoso para cfernandez, pero desde Moscu, Rusia, y desde un dispositivo que nunca se habia usado antes. No es lo esperable para alguien que trabaja desde Paysandu.',
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
            contenido: 'Estimados,\n\nAdjuntamos la factura correspondiente al pedido #4471, la cual se encuentra vencida desde la semana pasada.\n\nLes solicitamos procesar el pago a la brevedad para evitar recargos por mora. Cualquier consulta sobre el detalle de la factura, quedamos a disposicion.\n\nSaludos,\nDepartamento de Facturacion',
            tieneAdjunto: true,
            nombreAdjunto: 'Factura_4471.pdf',
            enlace: ''
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '10:02:33',
                contenido: 'El correo llego de facturacion@proveedor-logistico.net. La verificacion SPF paso, pero es la primera vez que este remitente le escribe a la empresa: no hay ningun historial previo de intercambio con este dominio.',
                direccionIp: '45.95.147.12',
                ubicacion: 'Amsterdam, Paises Bajos',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'sandbox.log',
                hora: '10:02:51',
                contenido: 'El adjunto "Factura_4471.pdf" en realidad no es un PDF: es un programa ejecutable de Windows disfrazado con doble extension (".pdf.exe"). El analisis automatico lo marco como malicioso, de la familia de malware AgentTesla (un troyano que roba contrasenas).',
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
            contenido: 'Hola,\n\nEstoy en una reunion importante y no puedo atender llamadas en este momento. Necesito que hagas una transferencia urgente de 8.000 USD a un proveedor nuevo, te paso los datos bancarios por este mismo correo.\n\nEs confidencial, asi que no lo comentes con nadie del equipo hasta que yo lo autorice formalmente. Necesito que esto se resuelva hoy mismo antes del cierre bancario.\n\nGracias por la rapidez,\nGerencia General',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: ''
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '15:17:09',
                contenido: 'El correo dice ser de gerencia.general@empresa-corp.co, pero configuraron que las respuestas vayan a otra casilla distinta (gerente.pagos2024@gmail.com), una cuenta de Gmail gratuita. Ademas, vino desde Lagos, Nigeria, y fallaron tanto SPF como DMARC.',
                direccionIp: '102.89.34.11',
                ubicacion: 'Lagos, Nigeria',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'auth.log',
                hora: '15:10:44',
                contenido: 'El gerente real (rgarcia) si tiene una sesion activa ese mismo dia, pero fue iniciada desde la oficina central en Paysandu, no desde donde se mando el correo: la persona real estaba trabajando normalmente en la oficina.',
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
            contenido: 'Estimado colaborador,\n\nDebido a la migracion a nuestra nueva plataforma de gestion de nomina, es necesario que actualices tus datos bancarios antes del cierre del periodo.\n\nSi no completas la actualizacion a tiempo, tu proximo pago podria demorarse. El proceso toma solo unos minutos, ingresa al enlace y segui los pasos indicados.\n\nGracias por tu colaboracion,\nRecursos Humanos',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: 'http://empresa-nomina.info/actualizar-datos'
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '09:30:02',
                contenido: 'El correo se envio a 148 destinatarios a la vez desde rrhh@empresa-nomina.info, un dominio que no es el de la empresa. La verificacion SPF dio un resultado dudoso (ni bien ni mal), algo tipico de dominios mal configurados o falsificados.',
                direccionIp: '194.26.29.40',
                ubicacion: 'Exterior',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'proxy.log',
                hora: '09:34:18',
                contenido: 'Un empleado (apereira) entro al enlace del correo. El proxy ya lo clasifico como "phishing" y detecto que el dominio se creo hace apenas 2 dias y no tiene certificado de seguridad valido.',
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
            contenido: 'Hola,\n\nTe comparto el reporte de ventas del trimestre que me pediste la semana pasada. El archivo tiene algunos graficos dinamicos, asi que vas a necesitar habilitar el contenido (macros) para que se vean correctamente al abrirlo.\n\nCualquier duda sobre los numeros me avisas.\n\nSaludos',
            tieneAdjunto: true,
            nombreAdjunto: 'Reporte_Q3.xlsm',
            enlace: ''
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '11:48:27',
                contenido: 'Llego de ventas.regional@empresa-partner.biz. La verificacion SPF paso, pero no tiene DKIM configurado y es la primera vez que este remitente le escribe a la empresa.',
                direccionIp: '91.219.237.100',
                ubicacion: 'Exterior',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'sandbox.log',
                hora: '11:48:40',
                contenido: 'El archivo "Reporte_Q3.xlsm" contiene una macro que se ejecuta sola al abrirlo, y esa macro llama a PowerShell con un comando oculto que intenta conectarse a una direccion externa. El analisis automatico lo marco como malicioso.',
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
            contenido: 'Hola,\n\nDurante un analisis rutinario detectamos una vulnerabilidad de seguridad en tu equipo que debe corregirse cuanto antes.\n\nDescarga el parche de seguridad desde el siguiente enlace e instalalo hoy mismo para evitar quedar expuesto. El proceso es automatico y no deberia tomar mas de un par de minutos.\n\nSaludos,\nSoporte Tecnico',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: 'https://bit.ly/3xUpdt3'
        },
        logs: [
            {
                archivo: 'proxy.log',
                hora: '14:05:51',
                contenido: 'Un empleado (lrodriguez) hizo clic en un enlace acortado. Ese enlace en realidad redirige a otro sitio distinto que ofrece descargar un archivo .exe, no un parche real de Windows.',
                direccionIp: '10.0.0.44',
                ubicacion: 'Red corporativa',
                dispositivo: 'Windows - Edge',
                usuario: 'lrodriguez',
                tipoAcceso: 'http'
            },
            {
                archivo: 'mail.log',
                hora: '14:01:13',
                contenido: 'El remitente dice ser "it-support@empresa-updates.com", pero el soporte real de la empresa usa la casilla soporte_it@empresa.com. Ademas, la verificacion SPF de ese dominio fallo.',
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
            contenido: 'Hola!\n\nTe comparti el documento del proyecto que estuvimos armando, quedo bastante completo. Fijate que revises sobre todo la seccion de cronograma, que la actualice hoy.\n\nCualquier comentario, avisame asi lo ajustamos antes de la entrega.\n\nSaludos!',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: 'https://empresa-sharepoint.com/doc/proyecto'
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '16:22:40',
                contenido: 'El correo dice ser de maria.gomez@empresa.com, pero no salio por el servidor de correo de la empresa: vino desde una IP externa asociada a la red Tor, y fallaron tanto SPF como DKIM. Alguien esta usando su nombre, no es ella.',
                direccionIp: '185.100.87.202',
                ubicacion: 'Exterior (nodo Tor)',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'auth.log',
                hora: '16:20:05',
                contenido: 'Maria Gomez no tiene ninguna sesion activa: esta de vacaciones hasta el lunes. No pudo haber mandado este correo ella misma en este momento.',
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
            contenido: 'Felicitaciones!\n\nTu direccion de correo fue seleccionada al azar entre miles de participantes como ganadora de nuestro sorteo internacional. El premio es de 5.000 USD, listo para ser reclamado.\n\nPara recibir tu premio, hace clic en el enlace y completa tus datos antes de que la oferta expire en 48 horas.\n\nNo dejes pasar esta oportunidad unica!',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: 'https://sorteo-internacional.com/reclamar'
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '07:55:18',
                contenido: 'El correo viene de premios@sorteo-internacional.com desde Lagos, Nigeria. No tiene ninguna verificacion SPF configurada y el sistema antispam le asigno un puntaje de riesgo muy alto.',
                direccionIp: '41.203.72.19',
                ubicacion: 'Lagos, Nigeria',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'proxy.log',
                hora: '07:58:02',
                contenido: 'Un empleado (dvargas) entro al enlace. El proxy ya tiene ese sitio clasificado como fraude, pero por alguna razon no llego a bloquear el acceso.',
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
            contenido: 'Hola equipo,\n\nConfirmo la reunion del jueves a las 10am para revisar el sprint. Vamos a repasar el avance de las tareas pendientes y planificar la proxima semana.\n\nSi alguien no puede asistir, avisen con anticipacion para reorganizar la agenda.\n\nNos vemos el jueves!',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: ''
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '09:12:03',
                contenido: 'El correo de maria.gomez@empresa.com salio por el servidor interno de la empresa, y paso tanto la verificacion SPF como DKIM: es un correo interno legitimo.',
                direccionIp: '10.0.0.2',
                ubicacion: 'Red corporativa',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'auth.log',
                hora: '08:47:31',
                contenido: 'Maria Gomez inicio sesion esa misma manana desde la oficina central, con un dispositivo ya registrado. Todo consistente con que ella mando el correo.',
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
            contenido: 'Estimados,\n\nAdjuntamos la factura correspondiente al mes de octubre por los servicios de hosting contratados. El detalle de los servicios facturados se encuentra en el archivo adjunto.\n\nEl vencimiento del pago es a los 15 dias de emitida esta factura, segun las condiciones habituales de nuestro contrato.\n\nSaludos,\nFacturacion HostingCloud',
            tieneAdjunto: true,
            nombreAdjunto: 'Factura_Octubre.pdf',
            enlace: ''
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '06:30:44',
                contenido: 'El correo de facturacion@hostingcloud.com paso SPF, DKIM y DMARC, y la empresa tiene 12 meses de historial de correos previos con este remitente.',
                direccionIp: '52.14.88.10',
                ubicacion: 'Estados Unidos',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'sandbox.log',
                hora: '06:30:59',
                contenido: 'El adjunto "Factura_Octubre.pdf" es realmente un PDF, sin macros ni enlaces sospechosos. El analisis lo marco como limpio.',
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
            contenido: 'Hola a todos,\n\nEstas son las novedades de este mes: se sumaron nuevos beneficios para el equipo, festejamos los cumpleanos de septiembre y destacamos los logros de cada area.\n\nPueden ver el boletin completo, con fotos y mas detalles, en la intranet.\n\nSaludos,\nComunicaciones',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: 'https://intranet.empresa.com/boletin'
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '09:00:00',
                contenido: 'El correo salio del servidor interno, con SPF y DKIM correctos, y se envio a los 148 empleados de la empresa como es habitual en los boletines mensuales.',
                direccionIp: '10.0.0.2',
                ubicacion: 'Red corporativa',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'proxy.log',
                hora: '09:06:27',
                contenido: 'Un empleado (apereira) entro al enlace de la intranet, un sitio ya clasificado como corporativo y usado habitualmente.',
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
            contenido: 'Hola equipo,\n\nLes comparto la presentacion final para la reunion de manana. Incluí los ultimos numeros que cerramos ayer con el cliente.\n\nSi ven algo para ajustar, avisenme hoy asi llego a tiempo con los cambios antes de la reunion.\n\nSaludos,\nJuan',
            tieneAdjunto: true,
            nombreAdjunto: 'Presentacion_Marketing.pptx',
            enlace: ''
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '17:40:10',
                contenido: 'El correo de juan.perez@empresa.com salio por el servidor interno, con SPF y DKIM correctos.',
                direccionIp: '10.0.0.2',
                ubicacion: 'Red corporativa',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'sandbox.log',
                hora: '17:40:22',
                contenido: 'El adjunto "Presentacion_Marketing.pptx" no tiene macros ni contenido sospechoso. Se marco como limpio.',
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
            contenido: 'Hola,\n\nDetectamos un inicio de sesion en tu cuenta corporativa desde un dispositivo que no reconociamos: un iPhone nuevo.\n\nSi fuiste vos, no necesitas hacer nada. Si no reconoces esta actividad, contacta a soporte de inmediato para proteger tu cuenta.\n\nEquipo de Seguridad',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: 'https://portal.empresa.com/seguridad'
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '12:15:36',
                contenido: 'El correo de seguridad@empresa.com es una alerta automatica real, enviada desde el servidor interno con SPF y DKIM correctos.',
                direccionIp: '10.0.0.2',
                ubicacion: 'Red corporativa',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'auth.log',
                hora: '12:14:58',
                contenido: 'El inicio de sesion se hizo con contrasena mas autenticacion de dos factores (MFA), desde la red WiFi de la oficina en Paysandu. El dispositivo fue registrado por soporte IT con un ticket asociado: alguien de soporte ya sabia y valido este nuevo telefono.',
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
            contenido: 'Hola,\n\nPor politica de seguridad, tu contrasena vence en 3 dias. Te recomendamos cambiarla ahora desde el portal interno para no quedarte sin acceso al sistema.\n\nSi tenes algun problema para cambiarla, podes contactar a soporte tecnico.\n\nSaludos,\nSistemas',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: 'https://portal.empresa.com/cambiar-contrasena'
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '06:00:01',
                contenido: 'El correo se genero automaticamente desde una tarea programada del sistema interno, con SPF y DKIM correctos.',
                direccionIp: '10.0.0.2',
                ubicacion: 'Red corporativa',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'proxy.log',
                hora: '09:21:47',
                contenido: 'El empleado (lrodriguez) entro al portal interno de la empresa para cambiar la contrasena. El sitio tiene certificado de seguridad valido y esta clasificado como corporativo.',
                direccionIp: '10.0.0.44',
                ubicacion: 'Red corporativa',
                usuario: 'lrodriguez',
                tipoAcceso: 'http'
            }
        ]
    }
];

module.exports = { BANCO_TICKETS };
