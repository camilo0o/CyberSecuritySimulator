import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import app from '../src/app.js';

const secreto = 'secreto-de-prueba';

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