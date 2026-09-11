import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import app from '../src/app.js';

const secreto = 'secreto-de-prueba';
const jugadorId = '507f1f77bcf86cd799439011';

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
        const token = jwt.sign(
            { sub: jugadorId },
            secreto
        );

        const respuesta = await request(app)
            .get('/')
            .set('Authorization', `Bearer ${token}`);

        expect(respuesta.status).toBe(200);
        expect(respuesta.body.status).toBe('ok');
        expect(respuesta.body.jugadorId).toBe(jugadorId);
    });
});