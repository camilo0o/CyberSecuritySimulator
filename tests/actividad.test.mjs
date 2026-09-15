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
import Email from '../src/models/Email.js';
import Empresa from '../src/models/Empresa.js';
import Jugador from '../src/models/Jugador.js';
import Logs from '../src/models/Logs.js';

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

async function crearPartidaConActividades() {
    const jugador = await Jugador.create({
        nombre: 'Jugador actividades'
    });

    const empresa = await Empresa.create({});

    jugador.empresaId = empresa._id;
    await jugador.save();

    const email = await Email.create({
        jugadorId: jugador._id,
        turno: 1,
        tipo: 'email',
        descripcion: 'Correo sospechoso de soporte',
        dificultad: 'media',
        nivelRiesgo: 75,
        esMalicioso: true,
        estado: 'pendiente',
        titulo: 'Actualiza tu contrasena',
        remitente: 'soporte@seguridad-falsa.com',
        destinatario: 'empleado@empresa.com',
        contenido: 'Necesitamos verificar tu cuenta.',
        tieneAdjunto: false,
        enlace: 'https://seguridad-falsa.com/login'
    });

    const logs = await Logs.create({
        jugadorId: jugador._id,
        turno: 1,
        tipo: 'logs',
        descripcion: 'Acceso fuera de horario',
        dificultad: 'alta',
        nivelRiesgo: 60,
        esMalicioso: true,
        estado: 'resuelta',
        contenido: 'Login aprobado a las 03:14',
        direccionIp: '203.0.113.10',
        ubicacion: 'Exterior',
        dispositivo: 'Linux',
        usuario: 'admin',
        tipoAcceso: 'ssh'
    });

    const token = jwt.sign(
        { sub: jugador._id.toString() },
        secreto
    );

    return { jugador, empresa, email, logs, token };
}

describe('GET /empresas/:id/actividades', () => {
    beforeEach(() => {
        process.env.JWT_SECRET = secreto;
    });

    it('lista las actividades de la empresa del jugador autenticado', async () => {
        const { empresa, token } = await crearPartidaConActividades();

        const respuesta = await request(app)
            .get(`/empresas/${empresa._id}/actividades`)
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(200);
        expect(respuesta.body.actividades).toHaveLength(2);
        expect(respuesta.body.actividades[0].tipo).toBe('email');
        expect(respuesta.body.actividades[0].titulo).toBe(
            'Actualiza tu contrasena'
        );
        expect(respuesta.body.actividades[1].tipo).toBe('logs');
        expect(respuesta.body.actividades[1].direccionIp).toBe(
            '203.0.113.10'
        );
    });

    it('filtra actividades por estado', async () => {
        const { empresa, token } = await crearPartidaConActividades();

        const respuesta = await request(app)
            .get(`/empresas/${empresa._id}/actividades?estado=pendiente`)
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(200);
        expect(respuesta.body.actividades).toHaveLength(1);
        expect(respuesta.body.actividades[0].estado).toBe('pendiente');
        expect(respuesta.body.actividades[0].tipo).toBe('email');
    });

    it('rechaza un filtro de estado inexistente', async () => {
        const { empresa, token } = await crearPartidaConActividades();

        const respuesta = await request(app)
            .get(`/empresas/${empresa._id}/actividades?estado=abierta`)
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(400);
        expect(respuesta.body.error).toBe('Estado de actividad invalido');
    });

    it('no permite listar actividades de una empresa ajena', async () => {
        const { token } = await crearPartidaConActividades();
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

    it('devuelve el detalle de una actividad email con sus campos propios', async () => {
        const { email, token } = await crearPartidaConActividades();

        const respuesta = await request(app)
            .get(`/actividades/${email._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(200);
        expect(respuesta.body.tipo).toBe('email');
        expect(respuesta.body.remitente).toBe(
            'soporte@seguridad-falsa.com'
        );
        expect(respuesta.body.enlace).toBe(
            'https://seguridad-falsa.com/login'
        );
    });

    it('devuelve el detalle de una actividad logs con sus campos propios', async () => {
        const { logs, token } = await crearPartidaConActividades();

        const respuesta = await request(app)
            .get(`/actividades/${logs._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(200);
        expect(respuesta.body.tipo).toBe('logs');
        expect(respuesta.body.direccionIp).toBe('203.0.113.10');
        expect(respuesta.body.tipoAcceso).toBe('ssh');
    });

    it('rechaza un identificador de actividad invalido', async () => {
        const { token } = await crearPartidaConActividades();

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
        const token = jwt.sign({ sub: jugadorId }, secreto);

        const respuesta = await request(app)
            .post('/actividades/id-invalido/resolver')
            .set('Authorization', `Bearer ${token}`)
            .send({ accion: 'bloquear' });

        expect(respuesta.status).toBe(400);
        expect(respuesta.body.error).toBe('Identificador invalido');
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
});
