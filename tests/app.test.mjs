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
import Jugador from '../src/models/Jugador.js';

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
    await Jugador.deleteMany({});
});

afterAll(async () => {
    await mongoose.disconnect();
    await replSet.stop();
});

function crearJugador() {
    return Jugador.create({
        nombre: 'Jugador app',
        email: 'app@test.com',
        password: 'hash-de-prueba'
    });
}

describe('GET /', () => {
    beforeEach(() => {
        process.env.JWT_SECRET = secreto;
    });

    it('rechaza la ruta sin JWT', async () => {
        const respuesta = await request(app)
            .get('/');

        expect(respuesta.status).toBe(401);
        expect(respuesta.body.error).toBe(
            'Token de autenticacion requerido'
        );
    });

    it('rechaza un JWT inválido', async () => {
        const respuesta = await request(app)
            .get('/')
            .set('Authorization', 'Bearer token-invalido');

        expect(respuesta.status).toBe(401);
        expect(respuesta.body.error).toBe(
            'Token invalido o expirado'
        );
    });

    it('permite acceder con un JWT válido', async () => {
        const jugador = await crearJugador();
        const token = jwt.sign(
            { sub: jugador._id.toString(), tokenVersion: jugador.tokenVersion },
            secreto
        );

        const respuesta = await request(app)
            .get('/')
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(200);
        expect(respuesta.body.status).toBe('ok');
        expect(respuesta.body.jugadorId).toBe(jugador._id.toString());
    });

    it('rechaza un JWT de un jugador que no existe', async () => {
        const token = jwt.sign(
            { sub: '507f1f77bcf86cd799439011', tokenVersion: 0 },
            secreto
        );

        const respuesta = await request(app)
            .get('/')
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(401);
        expect(respuesta.body.error).toBe('Sesión inválida o cerrada');
    });
});
