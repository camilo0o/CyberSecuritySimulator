import jwt from 'jsonwebtoken';
import request from 'supertest';
import { describe, expect, it, beforeEach } from 'vitest';

import app from '../src/app.js';
import { evaluarImpacto } from '../src/services/actividadService.js';

const secreto = 'secreto-de-prueba';
const jugadorId = '507f1f77bcf86cd799439011';

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