import jwt from 'jsonwebtoken';
import request from 'supertest';
import { describe, expect, it, beforeEach } from 'vitest';
import app from '../src/app.js';
import { evaluarImpacto } from '../src/services/actividadService.js';

const secreto = 'secreto-de-prueba';

describe('POST /actividades/:id/resolver', () => {
    beforeEach(() => { process.env.JWT_SECRET = secreto; });
    it('rechaza la solicitud sin JWT', async () => {
        const respuesta = await request(app).post('/actividades/507f1f77bcf86cd799439011/resolver').send({ accion: 'bloquear' });
        expect(respuesta.status).toBe(401);
    });
    it('acepta el JWT y llega a la validacion de negocio', async () => {
        const token = jwt.sign({ sub: '507f1f77bcf86cd799439011' }, secreto);
        const respuesta = await request(app).post('/actividades/id-invalido/resolver').set('Authorization', 'Bearer ' + token).send({ accion: 'bloquear' });
        expect(respuesta.status).toBe(400);
        expect(respuesta.body.error).toBe('Identificador invalido');
    });
});

describe('evaluarImpacto', () => {
    it('aplica el impacto de bloquear una actividad maliciosa a Empresa', () => {
        const resultado = evaluarImpacto({ nivelRiesgo: 80, esMalicioso: true }, 'bloquear', { seguridad: 50, reputacion: 50, dinero: 1000 });
        expect(resultado.correcta).toBe(true);
        expect(resultado.valoresEmpresa).toEqual({ seguridad: 100, reputacion: 90, dinero: 840 });
    });
});
