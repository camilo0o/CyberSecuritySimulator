import jwt from 'jsonwebtoken';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it
} from 'vitest';

import app from '../src/app.js';
import { evaluarImpacto } from '../src/services/actividadService.js';
import Actividad from '../src/models/Actividad.js';
import Empresa from '../src/models/Empresa.js';
import Jugador from '../src/models/Jugador.js';

const secreto = 'secreto-de-prueba';
const jugadorId = '507f1f77bcf86cd799439011';
let replSet;

beforeAll(async () => {
    replSet = await MongoMemoryReplSet.create({
        replSet: {
            count: 1,
            storageEngine: 'wiredTiger'
        }
    });

    await mongoose.connect(replSet.getUri());
});

afterEach(async () => {
    await Promise.all([
        Jugador.deleteMany({}),
        Empresa.deleteMany({}),
        Actividad.deleteMany({})
    ]);
});

afterAll(async () => {
    await mongoose.disconnect();
    await replSet.stop();
});

function tokenPara(jugador) {
    return jwt.sign(
        { sub: jugador._id.toString(), tokenVersion: jugador.tokenVersion },
        secreto
    );
}

async function crearPartidaConTickets() {
    const jugador = await Jugador.create({
        nombre: 'Jugador actividades',
        email: 'actividades@test.com',
        password: 'hash-de-prueba'
    });

    const empresa = await Empresa.create({});

    jugador.empresaId = empresa._id;
    await jugador.save();

    const pendiente = await Actividad.create({
        empresaId: empresa._id,
        jugadorId: jugador._id,
        turno: 1,
        descripcion: 'Correo sospechoso de soporte',
        dificultad: 'media',
        nivelRiesgo: 75,
        esMalicioso: true,
        estado: 'pendiente',
        correo: {
            titulo: 'Actualiza tu contrasena',
            remitente: 'soporte@seguridad-falsa.com',
            destinatario: 'empleado@empresa.com',
            contenido: 'Necesitamos verificar tu cuenta.',
            tieneAdjunto: false,
            enlace: 'https://seguridad-falsa.com/login'
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '08:41:12',
                contenido: 'mx01 postfix/smtpd: from=<soporte@seguridad-falsa.com> ip=203.0.113.10 spf=FAIL',
                direccionIp: '203.0.113.10'
            },
            {
                archivo: 'auth.log',
                hora: '08:52:40',
                contenido: 'srv-ad01 auth: Accepted password for empleado from 203.0.113.10',
                direccionIp: '203.0.113.10',
                usuario: 'empleado',
                tipoAcceso: 'vpn'
            }
        ]
    });

    const resuelta = await Actividad.create({
        empresaId: empresa._id,
        jugadorId: jugador._id,
        turno: 1,
        descripcion: 'Correo interno de una reunion',
        dificultad: 'baja',
        nivelRiesgo: 5,
        esMalicioso: false,
        estado: 'resuelta',
        correo: {
            titulo: 'Reunion del jueves',
            remitente: 'maria.gomez@empresa.com',
            destinatario: 'equipo@empresa.com',
            contenido: 'Confirmo la reunion del jueves.'
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '09:12:03',
                contenido: 'mx01 postfix/smtpd: from=<maria.gomez@empresa.com> ip=10.0.0.2 spf=PASS'
            }
        ]
    });

    return { jugador, empresa, pendiente, resuelta, token: tokenPara(jugador) };
}

describe('modelo Actividad (ticket)', () => {
    it('rechaza un ticket sin logs de evidencia', async () => {
        const ticket = new Actividad({
            jugadorId,
            descripcion: 'Ticket sin evidencia',
            nivelRiesgo: 10,
            correo: {
                titulo: 'Hola',
                remitente: 'a@empresa.com',
                destinatario: 'b@empresa.com',
                contenido: 'Texto'
            },
            logs: []
        });

        await expect(ticket.validate()).rejects.toThrow(
            'El ticket necesita al menos un log de evidencia'
        );
    });

    it('rechaza un log con un archivo que no existe', async () => {
        const ticket = new Actividad({
            jugadorId,
            descripcion: 'Ticket con log invalido',
            nivelRiesgo: 10,
            correo: {
                titulo: 'Hola',
                remitente: 'a@empresa.com',
                destinatario: 'b@empresa.com',
                contenido: 'Texto'
            },
            logs: [{ archivo: 'passwd', hora: '10:00:00', contenido: 'x' }]
        });

        await expect(ticket.validate()).rejects.toThrow();
    });
});

describe('GET /empresas/:id/actividades', () => {
    beforeEach(() => {
        process.env.JWT_SECRET = secreto;
    });

    it('lista los tickets de la empresa con su correo y sus logs', async () => {
        const { empresa, token } = await crearPartidaConTickets();

        const respuesta = await request(app)
            .get(`/empresas/${empresa._id}/actividades`)
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(200);
        expect(respuesta.body.actividades).toHaveLength(2);
        expect(respuesta.body.actividades[0].correo.titulo).toBe(
            'Actualiza tu contrasena'
        );
        expect(respuesta.body.actividades[0].logs).toHaveLength(2);
        expect(respuesta.body.actividades[0].tipo).toBeUndefined();
    });

    it('no revela el veredicto de los tickets pendientes', async () => {
        const { empresa, token } = await crearPartidaConTickets();

        const respuesta = await request(app)
            .get(`/empresas/${empresa._id}/actividades`)
            .set('Authorization', `Bearer ${token}`);

        const pendiente = respuesta.body.actividades.find(a => a.estado === 'pendiente');
        const resuelta = respuesta.body.actividades.find(a => a.estado === 'resuelta');

        expect(pendiente).not.toHaveProperty('esMalicioso');
        expect(pendiente).not.toHaveProperty('nivelRiesgo');
        expect(resuelta.esMalicioso).toBe(false);
        expect(resuelta.nivelRiesgo).toBe(5);
    });

    it('filtra tickets por estado', async () => {
        const { empresa, token } = await crearPartidaConTickets();

        const respuesta = await request(app)
            .get(`/empresas/${empresa._id}/actividades?estado=pendiente`)
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(200);
        expect(respuesta.body.actividades).toHaveLength(1);
        expect(respuesta.body.actividades[0].estado).toBe('pendiente');
        expect(respuesta.body.actividades[0].correo.remitente).toBe(
            'soporte@seguridad-falsa.com'
        );
    });

    it('rechaza un filtro de estado inexistente', async () => {
        const { empresa, token } = await crearPartidaConTickets();

        const respuesta = await request(app)
            .get(`/empresas/${empresa._id}/actividades?estado=abierta`)
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(400);
        expect(respuesta.body.error).toBe('Estado de actividad invalido');
    });

    it('no permite listar tickets de una empresa ajena', async () => {
        const { token } = await crearPartidaConTickets();
        const otraEmpresa = await Empresa.create({});

        const respuesta = await request(app)
            .get(`/empresas/${otraEmpresa._id}/actividades`)
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(404);
        expect(respuesta.body.error).toBe('Empresa no encontrada');
    });
});

describe('GET /actividades/:id', () => {
    beforeEach(() => {
        process.env.JWT_SECRET = secreto;
    });

    it('devuelve el correo del ticket', async () => {
        const { pendiente, token } = await crearPartidaConTickets();

        const respuesta = await request(app)
            .get(`/actividades/${pendiente._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(200);
        expect(respuesta.body.correo.remitente).toBe(
            'soporte@seguridad-falsa.com'
        );
        expect(respuesta.body.correo.enlace).toBe(
            'https://seguridad-falsa.com/login'
        );
    });

    it('devuelve los logs de evidencia del ticket', async () => {
        const { pendiente, token } = await crearPartidaConTickets();

        const respuesta = await request(app)
            .get(`/actividades/${pendiente._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(200);
        expect(respuesta.body.logs.map(log => log.archivo)).toEqual([
            'mail.log',
            'auth.log'
        ]);
        expect(respuesta.body.logs[1].tipoAcceso).toBe('vpn');
        expect(respuesta.body).not.toHaveProperty('esMalicioso');
    });

    it('rechaza un identificador de actividad invalido', async () => {
        const { token } = await crearPartidaConTickets();

        const respuesta = await request(app)
            .get('/actividades/id-invalido')
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(400);
        expect(respuesta.body.error).toBe('Identificador invalido');
    });
});

describe('POST /actividades/:id/resolver', () => {
    beforeEach(() => {
        process.env.JWT_SECRET = secreto;
    });

    it('rechaza la solicitud sin JWT', async () => {
        const respuesta = await request(app)
            .post(`/actividades/${jugadorId}/resolver`)
            .send({ accion: 'bloquear' });

        expect(respuesta.status).toBe(401);
        expect(respuesta.body.error).toBe(
            'Token de autenticacion requerido'
        );
    });

    it('rechaza un JWT inválido', async () => {
        const respuesta = await request(app)
            .post(`/actividades/${jugadorId}/resolver`)
            .set('Authorization', 'Bearer token-invalido')
            .send({ accion: 'bloquear' });

        expect(respuesta.status).toBe(401);
        expect(respuesta.body.error).toBe(
            'Token invalido o expirado'
        );
    });

    it('rechaza un JWT sin jugador identificado', async () => {
        const token = jwt.sign({}, secreto);

        const respuesta = await request(app)
            .post(`/actividades/${jugadorId}/resolver`)
            .set('Authorization', `Bearer ${token}`)
            .send({ accion: 'bloquear' });

        expect(respuesta.status).toBe(401);
        expect(respuesta.body.error).toBe(
            'El token no identifica al jugador'
        );
    });

    it('acepta el JWT y llega a la validación de negocio', async () => {
        const { token } = await crearPartidaConTickets();

        const respuesta = await request(app)
            .post('/actividades/id-invalido/resolver')
            .set('Authorization', `Bearer ${token}`)
            .send({ accion: 'bloquear' });

        expect(respuesta.status).toBe(400);
        expect(respuesta.body.error).toBe('Identificador invalido');
    });

    it('bloquear un ticket malicioso lo resuelve y mejora la seguridad', async () => {
        const { pendiente, token } = await crearPartidaConTickets();

        const respuesta = await request(app)
            .post(`/actividades/${pendiente._id}/resolver`)
            .set('Authorization', `Bearer ${token}`)
            .send({ accion: 'bloquear' });

        expect(respuesta.status).toBe(200);
        expect(respuesta.body.correcta).toBe(true);
        expect(respuesta.body.actividad.estado).toBe('resuelta');
        expect(respuesta.body.actividad.logs).toHaveLength(2);
    });
});

describe('evaluarImpacto', () => {
    it('aplica el impacto de bloquear una actividad maliciosa', () => {
        const resultado = evaluarImpacto(
            {
                nivelRiesgo: 80,
                esMalicioso: true
            },
            'bloquear',
            {
                seguridad: 50,
                reputacion: 50,
                dinero: 1000
            }
        );

        expect(resultado.correcta).toBe(true);
        expect(resultado.valoresEmpresa).toEqual({
            seguridad: 100,
            reputacion: 90,
            dinero: 840
        });
    });

    it('permitir un ticket alarmante pero legitimo es correcto', () => {
        const resultado = evaluarImpacto(
            {
                nivelRiesgo: 70,
                esMalicioso: false
            },
            'permitir',
            {
                seguridad: 50,
                reputacion: 50,
                dinero: 1000
            }
        );

        expect(resultado.esMaliciosa).toBe(false);
        expect(resultado.correcta).toBe(true);
    });
});
