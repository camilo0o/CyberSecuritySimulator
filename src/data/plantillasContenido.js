// Banco de tickets del juego.
// Cada ticket es un correo reportado (correo) mas la evidencia que el jugador
// puede investigar desde la consola (logs). La idea es que el correo solo no
// alcance para decidir: la respuesta real esta en los logs.
//
// archivo: mail.log (gateway de correo), auth.log (inicios de sesion),
//          proxy.log (navegacion web), sandbox.log (analisis de adjuntos)
//
// El campo "contenido" de cada log esta escrito en espanol llano a proposito
// (no como una linea cruda de syslog): el jugador no necesita ser un experto
// en ciberseguridad para leerlo, pero sigue mencionando los terminos tecnicos
// reales (SPF, DKIM, dominio recien creado, extension doble, etc.) para que
// haya algo que aprender e ir reconociendo turno a turno.

const BANCO_TICKETS = [
    {
        descripcion: 'cfernandez reporta un aviso de contrasena expirada',
        dificultad: 'media',
        nivelRiesgo: 75,
        esMalicioso: true,
        correo: {
            titulo: 'Tu contrasena ha expirado',
            remitente: 'soporte@segur1dad-corp.com',
            destinatario: 'cfernandez@empresa.com',
            contenido: 'Hola,\n\nDetectamos actividad inusual en tu cuenta durante las ultimas horas y, por tu seguridad, tu contrasena fue marcada para renovacion inmediata. Si no completas la verificacion dentro de las proximas 24 horas, tu cuenta quedara bloqueada de forma permanente y perderas el acceso al correo corporativo.\n\nPara evitarlo, ingresa al enlace de abajo y segui los pasos para confirmar tu identidad y establecer una nueva contrasena.\n\nSaludos,\nEquipo de Soporte',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: 'https://segur1dad-corp.com/reset'
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '08:41:12',
                contenido: 'Llego un correo de soporte@segur1dad-corp.com dirigido a cfernandez. La verificacion de origen (SPF) fallo, y tambien fallaron DKIM y DMARC: son tres controles que confirman si el servidor que mando el correo tiene permiso para usar ese dominio, y los tres dieron mal.',
                direccionIp: '185.220.101.7',
                ubicacion: 'Moscu, Rusia',
                usuario: 'cfernandez',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'proxy.log',
                hora: '08:43:05',
                contenido: 'cfernandez entro al enlace del correo (segur1dad-corp.com/reset) desde la red corporativa. El sitio todavia no esta clasificado por el proxy, y el dominio se registro hace apenas 3 dias: algo muy reciente para un sitio que dice pertenecer a una empresa de soporte.',
                direccionIp: '10.0.0.37',
                ubicacion: 'Red corporativa',
                dispositivo: 'Windows - Chrome',
                usuario: 'cfernandez',
                tipoAcceso: 'http'
            },
            {
                archivo: 'auth.log',
                hora: '08:52:40',
                contenido: 'Se acepto una contrasena valida para cfernandez, pero el inicio de sesion vino desde Moscu, Rusia, en un dispositivo que nunca se habia usado antes, y no desde la red de la oficina.',
                direccionIp: '185.220.101.7',
                ubicacion: 'Moscu, Rusia',
                dispositivo: 'Linux - Chrome',
                usuario: 'cfernandez',
                tipoAcceso: 'vpn'
            }
        ]
    },
    {
        descripcion: 'Contabilidad recibio una factura pendiente de pago',
        dificultad: 'alta',
        nivelRiesgo: 90,
        esMalicioso: true,
        correo: {
            titulo: 'Factura pendiente de pago #4471',
            remitente: 'facturacion@proveedor-logistico.net',
            destinatario: 'contabilidad@empresa.com',
            contenido: 'Estimados,\n\nAdjuntamos la factura correspondiente a los servicios prestados el mes pasado, la cual se encuentra vencida desde hace varios dias. Les pedimos procesar el pago a la brevedad para evitar recargos por mora.\n\nCualquier consulta sobre el detalle de la factura, no duden en contactarnos.\n\nSaludos cordiales,\nDepartamento de Facturacion',
            tieneAdjunto: true,
            nombreAdjunto: 'Factura_4471.pdf',
            enlace: ''
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '10:02:33',
                contenido: 'Llego un correo de facturacion@proveedor-logistico.net. La verificacion SPF paso, pero no tiene firma DKIM, y es la primera vez que la empresa recibe un correo de este remitente.',
                direccionIp: '45.95.147.12',
                ubicacion: 'Amsterdam, Paises Bajos',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'sandbox.log',
                hora: '10:02:51',
                contenido: 'El adjunto Factura_4471.pdf en realidad no es un PDF: al analizarlo resulto ser un programa ejecutable (.exe) disfrazado con una doble extension (.pdf.exe). El analisis automatico lo marco como malicioso, de la familia de malware AgentTesla.',
                tipoAcceso: 'analisis-adjunto'
            }
        ]
    },
    {
        descripcion: 'Finanzas recibio un pedido urgente de transferencia de gerencia',
        dificultad: 'alta',
        nivelRiesgo: 85,
        esMalicioso: true,
        correo: {
            titulo: 'Necesito que hagas esto de inmediato',
            remitente: 'gerencia.general@empresa-corp.co',
            destinatario: 'finanzas@empresa.com',
            contenido: 'Hola,\n\nEstoy en una reunion y no puedo atender llamadas en este momento. Necesito que hagas una transferencia de 8.000 USD a un proveedor nuevo lo antes posible, es urgente y no puede esperar hasta manana.\n\nTe paso los datos bancarios por este medio para agilizar el tramite. Por favor no lo comentes con nadie del equipo hasta que se resuelva, es confidencial.\n\nGracias,\nGerencia General',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: ''
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '15:17:09',
                contenido: 'Llego un correo que dice ser de gerencia.general@empresa-corp.co, pero las respuestas se redirigen a otra casilla distinta (gerente.pagos2024@gmail.com). Tanto SPF como DMARC fallaron.',
                direccionIp: '102.89.34.11',
                ubicacion: 'Lagos, Nigeria',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'auth.log',
                hora: '15:10:44',
                contenido: 'La gerente real (rgarcia) si inicio sesion ese mismo dia, pero desde la oficina central y a una hora distinta a la del correo urgente: no hay nada que indique que estuviera enviando ese pedido en ese momento.',
                direccionIp: '10.0.0.8',
                ubicacion: 'Oficina central',
                dispositivo: 'MacOS - Safari',
                usuario: 'rgarcia',
                tipoAcceso: 'portal-web'
            }
        ]
    },
    {
        descripcion: 'Varios empleados recibieron un pedido de RRHH para actualizar datos bancarios',
        dificultad: 'media',
        nivelRiesgo: 65,
        esMalicioso: true,
        correo: {
            titulo: 'Actualiza tus datos bancarios para la nomina',
            remitente: 'rrhh@empresa-nomina.info',
            destinatario: 'todos@empresa.com',
            contenido: 'Estimado/a colaborador/a,\n\nDebido a un cambio en la plataforma de gestion de nomina, es necesario que actualices tus datos bancarios antes del cierre del mes. Si no completas este paso, tu proximo pago podria demorarse.\n\nPor favor ingresa al enlace y completa el formulario con tus datos actualizados a la brevedad.\n\nSaludos,\nRecursos Humanos',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: 'http://empresa-nomina.info/actualizar-datos'
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '09:30:02',
                contenido: 'El correo llego de rrhh@empresa-nomina.info, un dominio que no es el de la empresa, y se mando a 148 destinatarios a la vez. La verificacion SPF dio un resultado intermedio (softfail), que tampoco es una buena senal.',
                direccionIp: '194.26.29.40',
                ubicacion: 'Exterior',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'proxy.log',
                hora: '09:34:18',
                contenido: 'apereira completo el formulario en empresa-nomina.info/actualizar-datos desde la red corporativa. El proxy clasifico ese sitio como phishing, el dominio se registro hace solo 2 dias y no tiene certificado de seguridad.',
                direccionIp: '10.0.0.21',
                ubicacion: 'Red corporativa',
                dispositivo: 'Windows - Chrome',
                usuario: 'apereira',
                tipoAcceso: 'http'
            }
        ]
    },
    {
        descripcion: 'Gerencia de ventas recibio un reporte trimestral con adjunto',
        dificultad: 'alta',
        nivelRiesgo: 80,
        esMalicioso: true,
        correo: {
            titulo: 'Reporte de ventas del trimestre',
            remitente: 'ventas.regional@empresa-partner.biz',
            destinatario: 'gerente.ventas@empresa.com',
            contenido: 'Hola,\n\nAqui esta el reporte de ventas del trimestre que me pediste. El archivo tiene algunos graficos dinamicos, asi que necesitas habilitar el contenido (macros) al abrirlo para que se vean correctamente.\n\nCualquier duda sobre los numeros me avisas.\n\nSaludos,\nVentas Regional',
            tieneAdjunto: true,
            nombreAdjunto: 'Reporte_Q3.xlsm',
            enlace: ''
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '11:48:27',
                contenido: 'Llego de ventas.regional@empresa-partner.biz. La verificacion SPF paso pero no hay firma DKIM, y es la primera vez que este remitente le escribe a la empresa.',
                direccionIp: '91.219.237.100',
                ubicacion: 'Exterior',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'sandbox.log',
                hora: '11:48:40',
                contenido: 'El archivo Reporte_Q3.xlsm tiene una macro que se ejecuta automaticamente al abrirlo (AutoOpen) y que lanza PowerShell con un comando oculto, conectandose despues a una direccion externa. El analisis lo marco como malicioso.',
                tipoAcceso: 'analisis-adjunto'
            }
        ]
    },
    {
        descripcion: 'lrodriguez reporta un aviso de actualizacion de seguridad',
        dificultad: 'media',
        nivelRiesgo: 55,
        esMalicioso: true,
        correo: {
            titulo: 'Tu equipo requiere una actualizacion de seguridad urgente',
            remitente: 'it-support@empresa-updates.com',
            destinatario: 'lrodriguez@empresa.com',
            contenido: 'Hola,\n\nSe detecto una vulnerabilidad critica de seguridad en tu equipo que requiere ser corregida de inmediato. Por favor, descarga el parche de seguridad desde el siguiente enlace y ejecutalo antes de que termine el dia.\n\nSi no lo haces, tu equipo podria quedar expuesto a un ataque.\n\nSaludos,\nSoporte IT',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: 'https://bit.ly/3xUpdt3'
        },
        logs: [
            {
                archivo: 'proxy.log',
                hora: '14:05:51',
                contenido: 'lrodriguez hizo clic en el enlace acortado del correo (bit.ly), y este redirigio a cdn-files-update.xyz, un sitio distinto, para descargar un archivo .exe.',
                direccionIp: '10.0.0.44',
                ubicacion: 'Red corporativa',
                dispositivo: 'Windows - Edge',
                usuario: 'lrodriguez',
                tipoAcceso: 'http'
            },
            {
                archivo: 'mail.log',
                hora: '14:01:13',
                contenido: 'El correo llego de it-support@empresa-updates.com, un dominio ajeno a la empresa. La verificacion SPF fallo.',
                direccionIp: '203.0.113.55',
                ubicacion: 'Desconocida',
                tipoAcceso: 'smtp'
            }
        ]
    },
    {
        descripcion: 'nmartinez recibio un documento compartido por una companera',
        dificultad: 'alta',
        nivelRiesgo: 70,
        esMalicioso: true,
        correo: {
            titulo: 'Te comparti un documento',
            remitente: 'maria.gomez@empresa.com',
            destinatario: 'nmartinez@empresa.com',
            contenido: 'Hola!\n\nTe comparto el documento del proyecto que estuvimos hablando, quedo bastante completo. Revisalo cuando puedas y dejame tus comentarios, sobre todo en la seccion de cronograma.\n\nCualquier cosa me escribis.\n\nSaludos,\nMaria',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: 'https://empresa-sharepoint.com/doc/proyecto'
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '16:22:40',
                contenido: 'El correo dice ser de maria.gomez@empresa.com, pero no vino desde la red interna (los correos internos reales salen siempre desde la misma direccion fija) sino desde un nodo Tor en el exterior. Fallaron tanto SPF como DKIM.',
                direccionIp: '185.100.87.202',
                ubicacion: 'Exterior (nodo Tor)',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'auth.log',
                hora: '16:20:05',
                contenido: 'Maria Gomez no tiene ninguna sesion activa en este momento: esta de vacaciones hasta el lunes, asi que no pudo haber mandado este correo ella misma.',
                usuario: 'maria.gomez',
                tipoAcceso: 'directorio'
            }
        ]
    },
    {
        descripcion: 'dvargas reporta un correo de un sorteo',
        dificultad: 'baja',
        nivelRiesgo: 45,
        esMalicioso: true,
        correo: {
            titulo: 'Has sido seleccionado como ganador',
            remitente: 'premios@sorteo-internacional.com',
            destinatario: 'dvargas@empresa.com',
            contenido: 'Felicidades!\n\nHas sido seleccionado como ganador de nuestro sorteo internacional, con un premio de 5.000 USD. Para reclamarlo, hace clic en el enlace de abajo y completa tus datos antes de que expire la oferta, en las proximas 24 horas.\n\nNo dejes pasar esta oportunidad!\n\nSaludos,\nSorteo Internacional',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: 'https://sorteo-internacional.com/reclamar'
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '07:55:18',
                contenido: 'El correo llego de premios@sorteo-internacional.com sin ninguna verificacion de origen configurada (SPF ausente), y el sistema antispam le asigno un puntaje muy alto de sospecha (8.7 sobre 10).',
                direccionIp: '41.203.72.19',
                ubicacion: 'Lagos, Nigeria',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'proxy.log',
                hora: '07:58:02',
                contenido: 'dvargas entro al enlace para reclamar el premio. El proxy clasifico el sitio directamente como fraude, aunque todavia no llego a bloquearlo.',
                direccionIp: '10.0.0.33',
                ubicacion: 'Red corporativa',
                dispositivo: 'MacOS - Safari',
                usuario: 'dvargas',
                tipoAcceso: 'http'
            }
        ]
    },

    {
        descripcion: 'El equipo de desarrollo recibio una confirmacion de reunion',
        dificultad: 'baja',
        nivelRiesgo: 5,
        esMalicioso: false,
        correo: {
            titulo: 'Confirmacion reunion de equipo del jueves',
            remitente: 'maria.gomez@empresa.com',
            destinatario: 'equipo.desarrollo@empresa.com',
            contenido: 'Hola equipo,\n\nConfirmo la reunion de seguimiento del jueves a las 10am para revisar el avance del sprint actual. Vamos a repasar las tareas pendientes y planificar la proxima semana.\n\nNos vemos en la sala de siempre.\n\nSaludos,\nMaria',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: ''
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '09:12:03',
                contenido: 'El correo salio desde la direccion interna de la empresa (relay interno), y paso correctamente las verificaciones SPF y DKIM.',
                direccionIp: '10.0.0.2',
                ubicacion: 'Red corporativa',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'auth.log',
                hora: '08:47:31',
                contenido: 'Maria Gomez inicio sesion ese mismo dia desde la oficina central, con un dispositivo ya registrado a su nombre.',
                direccionIp: '10.0.0.19',
                ubicacion: 'Oficina central',
                dispositivo: 'Windows - Outlook',
                usuario: 'maria.gomez',
                tipoAcceso: 'portal-web'
            }
        ]
    },
    {
        descripcion: 'Contabilidad recibio la factura mensual de hosting',
        dificultad: 'media',
        nivelRiesgo: 10,
        esMalicioso: false,
        correo: {
            titulo: 'Factura de servicios de hosting - Octubre',
            remitente: 'facturacion@hostingcloud.com',
            destinatario: 'contabilidad@empresa.com',
            contenido: 'Estimados,\n\nAdjuntamos la factura correspondiente al mes de octubre por los servicios de hosting contratados. El monto y el detalle de los servicios se encuentran en el archivo adjunto.\n\nComo siempre, el pago se procesa segun los terminos habituales acordados.\n\nSaludos,\nFacturacion HostingCloud',
            tieneAdjunto: true,
            nombreAdjunto: 'Factura_Octubre.pdf',
            enlace: ''
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '06:30:44',
                contenido: 'El correo llego de facturacion@hostingcloud.com, paso SPF, DKIM y DMARC correctamente, y la empresa tiene un historial de 12 meses recibiendo correos de este mismo remitente sin problemas.',
                direccionIp: '52.14.88.10',
                ubicacion: 'Estados Unidos',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'sandbox.log',
                hora: '06:30:59',
                contenido: 'El archivo Factura_Octubre.pdf es realmente un PDF, sin macros ni enlaces ocultos. El analisis automatico lo marco como limpio.',
                tipoAcceso: 'analisis-adjunto'
            }
        ]
    },
    {
        descripcion: 'Todos recibieron el boletin interno del mes',
        dificultad: 'baja',
        nivelRiesgo: 0,
        esMalicioso: false,
        correo: {
            titulo: 'Boletin interno - Novedades del mes',
            remitente: 'comunicaciones@empresa.com',
            destinatario: 'todos@empresa.com',
            contenido: 'Hola a todos,\n\nAqui les compartimos las novedades de este mes: nuevos beneficios para el equipo, cumpleanos y los logros mas destacados de cada area.\n\nPueden ver el boletin completo en la intranet.\n\nSaludos,\nComunicaciones',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: 'https://intranet.empresa.com/boletin'
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '09:00:00',
                contenido: 'El correo salio desde la red interna de la empresa, paso SPF y DKIM, y se mando a los 148 empleados como es habitual en las comunicaciones internas.',
                direccionIp: '10.0.0.2',
                ubicacion: 'Red corporativa',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'proxy.log',
                hora: '09:06:27',
                contenido: 'apereira entro al enlace del boletin desde la red corporativa. El proxy lo clasifico como sitio corporativo, sin ninguna alerta.',
                direccionIp: '10.0.0.21',
                ubicacion: 'Red corporativa',
                usuario: 'apereira',
                tipoAcceso: 'http'
            }
        ]
    },
    {
        descripcion: 'Marketing recibio una presentacion para la reunion',
        dificultad: 'media',
        nivelRiesgo: 5,
        esMalicioso: false,
        correo: {
            titulo: 'Presentacion para la reunion de manana',
            remitente: 'juan.perez@empresa.com',
            destinatario: 'equipo.marketing@empresa.com',
            contenido: 'Hola equipo,\n\nLes comparto la presentacion final para la reunion de manana con el resumen de la campana del trimestre. Ya esta revisada, pero si ven algun ajuste de ultimo momento avisenme hoy mismo.\n\nNos vemos manana.\n\nSaludos,\nJuan',
            tieneAdjunto: true,
            nombreAdjunto: 'Presentacion_Marketing.pptx',
            enlace: ''
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '17:40:10',
                contenido: 'El correo salio desde la red interna de la empresa, con SPF y DKIM correctos.',
                direccionIp: '10.0.0.2',
                ubicacion: 'Red corporativa',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'sandbox.log',
                hora: '17:40:22',
                contenido: 'El archivo Presentacion_Marketing.pptx es un PowerPoint real, sin macros. El analisis lo marco como limpio.',
                tipoAcceso: 'analisis-adjunto'
            }
        ]
    },
    {
        descripcion: 'nmartinez reporta una alerta de inicio de sesion desde un dispositivo nuevo',
        dificultad: 'alta',
        nivelRiesgo: 40,
        esMalicioso: false,
        correo: {
            titulo: 'ALERTA: inicio de sesion desde un dispositivo nuevo',
            remitente: 'seguridad@empresa.com',
            destinatario: 'nmartinez@empresa.com',
            contenido: 'Hola,\n\nDetectamos un inicio de sesion en tu cuenta desde un dispositivo nuevo (un iPhone) que no habiamos visto antes asociado a tu usuario.\n\nSi fuiste vos, no necesitas hacer nada. Si no reconoces este acceso, contacta a soporte de inmediato para asegurar tu cuenta.\n\nSaludos,\nEquipo de Seguridad',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: 'https://portal.empresa.com/seguridad'
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '12:15:36',
                contenido: 'El correo de alerta salio desde la red interna de la empresa, con SPF y DKIM correctos: es un aviso automatico real del sistema de seguridad.',
                direccionIp: '10.0.0.2',
                ubicacion: 'Red corporativa',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'auth.log',
                hora: '12:14:58',
                contenido: 'El inicio de sesion se hizo con contrasena mas doble factor de autenticacion (MFA), desde la red WiFi de la oficina. El dispositivo nuevo fue registrado por soporte IT ese mismo dia, con un ticket de por medio (#2291).',
                direccionIp: '192.168.1.14',
                ubicacion: 'Red corporativa (WiFi)',
                dispositivo: 'iPhone - App corporativa',
                usuario: 'nmartinez',
                tipoAcceso: 'mobile'
            }
        ]
    },
    {
        descripcion: 'lrodriguez reporta un aviso de vencimiento de contrasena',
        dificultad: 'alta',
        nivelRiesgo: 35,
        esMalicioso: false,
        correo: {
            titulo: 'Tu contrasena vence en 3 dias',
            remitente: 'no-reply@empresa.com',
            destinatario: 'lrodriguez@empresa.com',
            contenido: 'Hola,\n\nPor politica de seguridad, tu contrasena vence en 3 dias. Te recomendamos cambiarla ahora desde el portal interno para evitar quedarte sin acceso cuando llegue la fecha.\n\nSi tenes dudas sobre como hacerlo, podes consultar la guia en la intranet.\n\nSaludos,\nSistemas',
            tieneAdjunto: false,
            nombreAdjunto: '',
            enlace: 'https://portal.empresa.com/cambiar-contrasena'
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '06:00:01',
                contenido: 'El correo salio automaticamente desde una tarea programada interna de la empresa, con SPF y DKIM correctos.',
                direccionIp: '10.0.0.2',
                ubicacion: 'Red corporativa',
                tipoAcceso: 'smtp'
            },
            {
                archivo: 'proxy.log',
                hora: '09:21:47',
                contenido: 'lrodriguez entro al portal para cambiar la contrasena desde la red corporativa. El proxy lo clasifico como sitio corporativo, con certificado de seguridad valido.',
                direccionIp: '10.0.0.44',
                ubicacion: 'Red corporativa',
                usuario: 'lrodriguez',
                tipoAcceso: 'http'
            }
        ]
    }
];

module.exports = { BANCO_TICKETS };
