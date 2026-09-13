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
import app from '../src/app.js';
import Jugador from '../src/models/Jugador.js';
import Empresa from '../src/models/Empresa.js';
import Actividad from '../src/models/Actividad.js';
import Historial from '../src/models/Historial.js';


const secreto = 'secreto-de-prueba';
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
        Actividad.deleteMany({}),
        Historial.deleteMany({})
    ]);
});

afterAll(async () => {
    await mongoose.disconnect();
    await replSet.stop();
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
        const token = jwt.sign(
            { sub: '507f1f77bcf86cd799439011' },
            secreto
        );

        const respuesta = await request(app)
            .post('/empresas/id-invalido/avanzar')
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(400);
        expect(respuesta.body.error).toBe('Identificador invalido');
    });

    it('penaliza pendientes y genera nuevas actividades', async () => {
        const jugador = await Jugador.create({
            nombre: 'Jugador de prueba'
        });

        const empresa = await Empresa.create({
            turno: 1,
            maxTurnos: 10
        });

        jugador.empresaId = empresa._id;
        await jugador.save();

        await Actividad.create({
            jugadorId: jugador._id,
            turno: 1,
            tipo: 'email',
            descripcion: 'Correo pendiente',
            nivelRiesgo: 20,
            estado: 'pendiente'
        });

        const token = jwt.sign(
            { sub: jugador._id.toString() },
            secreto
        );

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
    });

    it('finaliza la partida cuando se agota el máximo de turnos', async () => {
        const jugador = await Jugador.create({
            nombre: 'Jugador ganador'
        });

        const empresa = await Empresa.create({
            turno: 1,
            maxTurnos: 1
        });

        jugador.empresaId = empresa._id;
        await jugador.save();

        const token = jwt.sign(
            { sub: jugador._id.toString() },
            secreto
        );

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
        const jugador = await Jugador.create({
            nombre: 'Jugador derrotado'
        });

        const empresa = await Empresa.create({
            turno: 1,
            maxTurnos: 10
        });

        jugador.empresaId = empresa._id;
        await jugador.save();

        await Actividad.create({
            jugadorId: jugador._id,
            turno: 1,
            tipo: 'logs',
            descripcion: 'Incidente crítico',
            nivelRiesgo: 100,
            estado: 'pendiente'
        });

        const token = jwt.sign(
            { sub: jugador._id.toString() },
            secreto
        );

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
        const jugador = await Jugador.create({
            nombre: 'Jugador ranking'
        });

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

        const token = jwt.sign(
            { sub: jugador._id.toString() },
            secreto
        );

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
        const jugadorUno = await Jugador.create({
            nombre: 'Jugador primero'
        });

        const jugadorDos = await Jugador.create({
            nombre: 'Jugador segundo'
        });

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

        const token = jwt.sign(
            { sub: jugadorUno._id.toString() },
            secreto
        );

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