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

import { obtenerRanking } from '../src/services/historialService.js';
import { sembrarPlantillas } from '../src/data/seedPlantillas.js';
import app from '../src/app.js';
import Jugador from '../src/models/Jugador.js';
import Empresa from '../src/models/Empresa.js';
import Actividad from '../src/models/Actividad.js';
import Historial from '../src/models/Historial.js';
import PlantillaActividad from '../src/models/PlantillaActividad.js';
import { BANCO_TICKETS } from '../src/data/plantillasContenido.js';


const secreto = 'secreto-de-prueba';
let replSet;
let contadorJugadores = 0;

function crearJugador(nombre) {
    contadorJugadores += 1;

    return Jugador.create({
        nombre,
        email: `jugador${contadorJugadores}@test.com`,
        password: 'hash-de-prueba'
    });
}

function tokenPara(jugador) {
    return jwt.sign(
        { sub: jugador._id.toString(), tokenVersion: jugador.tokenVersion },
        secreto
    );
}

function ticketPendiente(jugadorId, descripcion, nivelRiesgo) {
    return {
        jugadorId,
        turno: 1,
        descripcion,
        nivelRiesgo,
        estado: 'pendiente',
        correo: {
            titulo: descripcion,
            remitente: 'alguien@externo.com',
            destinatario: 'empleado@empresa.com',
            contenido: 'Contenido de prueba'
        },
        logs: [
            {
                archivo: 'mail.log',
                hora: '10:00:00',
                contenido: 'mx01 postfix/smtpd: from=<alguien@externo.com> spf=FAIL'
            }
        ]
    };
}

beforeAll(async () => {
    replSet = await MongoMemoryReplSet.create({
        replSet: {
            count: 1,
            storageEngine: 'wiredTiger'
        }
    });

    await mongoose.connect(replSet.getUri());
    await sembrarPlantillas();
});

afterEach(async () => {
    await Promise.all([
        Jugador.deleteMany({}),
        Empresa.deleteMany({}),
        Actividad.deleteMany({}),
        Historial.deleteMany({})
    ]);
});

afterAll(async () => {
    await mongoose.disconnect();
    await replSet.stop();
});


describe('banco de tickets', () => {
    it('siembra todas las plantillas con correo y logs de evidencia', async () => {
        const plantillas = await PlantillaActividad.find({});

        expect(plantillas).toHaveLength(BANCO_TICKETS.length);
        plantillas.forEach(plantilla => {
            expect(plantilla.correo.remitente).toBeTruthy();
            expect(plantilla.logs.length).toBeGreaterThan(0);
        });
    });
});

describe('POST /empresas/:id/avanzar', () => {
    beforeEach(() => {
        process.env.JWT_SECRET = secreto;
    });

    it('rechaza avanzar sin JWT', async () => {
        const respuesta = await request(app)
            .post('/empresas/507f1f77bcf86cd799439011/avanzar');

        expect(respuesta.status).toBe(401);
        expect(respuesta.body.error).toBe(
            'Token de autenticacion requerido'
        );
    });

    it('rechaza un JWT inválido', async () => {
        const respuesta = await request(app)
            .post('/empresas/507f1f77bcf86cd799439011/avanzar')
            .set('Authorization', 'Bearer token-invalido');

        expect(respuesta.status).toBe(401);
        expect(respuesta.body.error).toBe(
            'Token invalido o expirado'
        );
    });

    it('rechaza un JWT sin jugador identificado', async () => {
        const token = jwt.sign({}, secreto);

        const respuesta = await request(app)
            .post('/empresas/507f1f77bcf86cd799439011/avanzar')
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(401);
        expect(respuesta.body.error).toBe(
            'El token no identifica al jugador'
        );
    });

    it('rechaza un identificador de empresa inválido', async () => {
        const jugador = await crearJugador('Jugador id invalido');
        const token = tokenPara(jugador);

        const respuesta = await request(app)
            .post('/empresas/id-invalido/avanzar')
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(400);
        expect(respuesta.body.error).toBe('Identificador invalido');
    });

    it('penaliza pendientes y genera nuevas actividades', async () => {
        const jugador = await crearJugador('Jugador de prueba');

        const empresa = await Empresa.create({
            turno: 1,
            maxTurnos: 10
        });

        jugador.empresaId = empresa._id;
        await jugador.save();

        await Actividad.create(
            ticketPendiente(jugador._id, 'Correo pendiente', 20)
        );

        const token = tokenPara(jugador);

        const respuesta = await request(app)
            .post(`/empresas/${empresa._id}/avanzar`)
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(200);
        expect(respuesta.body.pendientesPenalizadas).toBe(1);
        expect(respuesta.body.empresa.turno).toBe(2);
        expect(respuesta.body.empresa.seguridad).toBe(80);
        expect(respuesta.body.empresa.reputacion).toBe(80);
        expect(respuesta.body.empresa.dinero).toBe(9900);
        expect(respuesta.body.actividades).toHaveLength(2);

        const pendiente = await Actividad.findOne({
            jugadorId: jugador._id,
            turno: 1
        });

        expect(pendiente.estado).toBe('ignorada');

        const nuevas = await Actividad.find({
            jugadorId: jugador._id,
            turno: 2
        });

        expect(nuevas).toHaveLength(2);
        expect(nuevas[0].correo.remitente).toBeTruthy();
        expect(nuevas[0].logs.length).toBeGreaterThan(0);
    });

    it('finaliza la partida cuando se agota el máximo de turnos', async () => {
        const jugador = await crearJugador('Jugador ganador');

        const empresa = await Empresa.create({
            turno: 1,
            maxTurnos: 1
        });

        jugador.empresaId = empresa._id;
        await jugador.save();

        const token = tokenPara(jugador);

        const respuesta = await request(app)
            .post(`/empresas/${empresa._id}/avanzar`)
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(200);
        expect(respuesta.body.empresa.estado).toBe('victoria');
        expect(respuesta.body.actividades).toHaveLength(0);

        const historial = await Historial.findOne({
            empresaId: empresa._id
        });

        expect(historial).not.toBeNull();
        expect(historial.nombreJugador).toBe('Jugador ganador');
    });

    it('finaliza la partida por pérdida de seguridad', async () => {
        const jugador = await crearJugador('Jugador derrotado');

        const empresa = await Empresa.create({
            turno: 1,
            maxTurnos: 10
        });

        jugador.empresaId = empresa._id;
        await jugador.save();

        await Actividad.create(
            ticketPendiente(jugador._id, 'Incidente crítico', 100)
        );

        const token = tokenPara(jugador);

        const respuesta = await request(app)
            .post(`/empresas/${empresa._id}/avanzar`)
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(200);
        expect(respuesta.body.empresa.estado).toBe('derrota');
        expect(respuesta.body.empresa.seguridad).toBe(0);
        expect(respuesta.body.actividades).toHaveLength(0);

        const historial = await Historial.findOne({
            empresaId: empresa._id
        });

        expect(historial).not.toBeNull();
    });
});

describe('POST /empresas/:id/rendirse', () => {
    beforeEach(() => {
        process.env.JWT_SECRET = secreto;
    });

    it('rechaza rendirse sin JWT', async () => {
        const respuesta = await request(app)
            .post('/empresas/507f1f77bcf86cd799439011/rendirse');

        expect(respuesta.status).toBe(401);
        expect(respuesta.body.error).toBe(
            'Token de autenticacion requerido'
        );
    });

    it('finaliza la partida en derrota sin importar las métricas', async () => {
        const jugador = await crearJugador('Jugador que se rinde');

        const empresa = await Empresa.create({
            turno: 3,
            seguridad: 80,
            reputacion: 70,
            dinero: 5000
        });

        jugador.empresaId = empresa._id;
        await jugador.save();

        const token = tokenPara(jugador);

        const respuesta = await request(app)
            .post(`/empresas/${empresa._id}/rendirse`)
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(200);
        expect(respuesta.body.empresa.estado).toBe('derrota');
        expect(respuesta.body.empresa.seguridad).toBe(80);

        const historial = await Historial.findOne({ empresaId: empresa._id });
        expect(historial).not.toBeNull();
        expect(historial.nombreJugador).toBe('Jugador que se rinde');
    });

    it('rechaza rendirse en una partida que ya finalizó', async () => {
        const jugador = await crearJugador('Jugador con partida finalizada');

        const empresa = await Empresa.create({ estado: 'victoria' });

        jugador.empresaId = empresa._id;
        await jugador.save();

        const token = tokenPara(jugador);

        const respuesta = await request(app)
            .post(`/empresas/${empresa._id}/rendirse`)
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(409);
        expect(respuesta.body.error).toBe('La partida ya finalizo');
    });
});

describe('rutas de empresas', () => {
    beforeEach(() => {
        process.env.JWT_SECRET = secreto;
    });

    it('rechaza crear una empresa sin JWT', async () => {
        const respuesta = await request(app)
            .post('/empresas')
            .send({});

        expect(respuesta.status).toBe(401);
        expect(respuesta.body.error).toBe(
            'Token de autenticacion requerido'
        );
    });

    it('al iniciar la partida siembra 2 tickets para el turno 1', async () => {
        const jugador = await crearJugador('Jugador nuevo');

        const respuesta = await request(app)
            .post('/empresas')
            .set('Authorization', `Bearer ${tokenPara(jugador)}`)
            .send({});

        expect(respuesta.status).toBe(201);

        const tickets = await Actividad.find({ jugadorId: jugador._id, turno: 1 });

        expect(tickets).toHaveLength(2);
        tickets.forEach(ticket => {
            expect(ticket.estado).toBe('pendiente');
            expect(ticket.correo.titulo).toBeTruthy();
            expect(ticket.logs.length).toBeGreaterThan(0);
        });
    });

    it('rechaza consultar una empresa sin JWT', async () => {
        const respuesta = await request(app)
            .get('/empresas/507f1f77bcf86cd799439011');

        expect(respuesta.status).toBe(401);
        expect(respuesta.body.error).toBe(
            'Token de autenticacion requerido'
        );
    });

    it('rechaza consultar una empresa con un JWT inválido', async () => {
        const respuesta = await request(app)
            .get('/empresas/507f1f77bcf86cd799439011')
            .set('Authorization', 'Bearer token-invalido');

        expect(respuesta.status).toBe(401);
        expect(respuesta.body.error).toBe(
            'Token invalido o expirado'
        );
    });
});

describe('GET /historial/ranking', () => {
    beforeEach(() => {
        process.env.JWT_SECRET = secreto;
    });

    it('rechaza consultar el ranking sin JWT', async () => {
        const respuesta = await request(app)
            .get('/historial/ranking');

        expect(respuesta.status).toBe(401);
        expect(respuesta.body.error).toBe(
            'Token de autenticacion requerido'
        );
    });

    it('rechaza un JWT inválido', async () => {
        const respuesta = await request(app)
            .get('/historial/ranking')
            .set('Authorization', 'Bearer token-invalido');

        expect(respuesta.status).toBe(401);
        expect(respuesta.body.error).toBe(
            'Token invalido o expirado'
        );
    });

    it('rechaza un JWT sin jugador identificado', async () => {
        const token = jwt.sign({}, secreto);

        const respuesta = await request(app)
            .get('/historial/ranking')
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(401);
        expect(respuesta.body.error).toBe(
            'El token no identifica al jugador'
        );
    });

    it('devuelve el ranking con un JWT válido', async () => {
        const jugador = await crearJugador('Jugador ranking');

        const empresa = await Empresa.create({
            estado: 'victoria'
        });

        await Historial.create({
            jugadorId: jugador._id,
            empresaId: empresa._id,
            nombreJugador: jugador.nombre,
            seguridadFinal: 90,
            reputacionFinal: 80,
            dineroFinal: 9500
        });

        const token = tokenPara(jugador);

        const respuesta = await request(app)
            .get('/historial/ranking')
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(200);
        expect(respuesta.body.ranking).toHaveLength(1);
        expect(respuesta.body.ranking[0].posicion).toBe(1);
        expect(respuesta.body.ranking[0].nombreJugador).toBe(
            'Jugador ranking'
        );
        expect(respuesta.body.ranking[0].seguridadFinal).toBe(90);
    });

    it('ordena las partidas por sus métricas finales', async () => {
        const jugadorUno = await crearJugador('Jugador primero');

        const jugadorDos = await crearJugador('Jugador segundo');

        const empresaUno = await Empresa.create({
            estado: 'victoria'
        });

        const empresaDos = await Empresa.create({
            estado: 'derrota'
        });

        await Historial.create([
            {
                jugadorId: jugadorUno._id,
                empresaId: empresaUno._id,
                nombreJugador: jugadorUno.nombre,
                seguridadFinal: 50,
                reputacionFinal: 50,
                dineroFinal: 5000
            },
            {
                jugadorId: jugadorDos._id,
                empresaId: empresaDos._id,
                nombreJugador: jugadorDos.nombre,
                seguridadFinal: 90,
                reputacionFinal: 90,
                dineroFinal: 9000
            }
        ]);

        const token = tokenPara(jugadorUno);

        const respuesta = await request(app)
            .get('/historial/ranking')
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(200);
        expect(respuesta.body.ranking[0].nombreJugador).toBe(
            'Jugador segundo'
        );
        expect(respuesta.body.ranking[0].posicion).toBe(1);
        expect(respuesta.body.ranking[1].posicion).toBe(2);
    });
});