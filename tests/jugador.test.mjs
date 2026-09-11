import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../src/app.js';
import { validarCrearJugador } from '../src/validators/jugadorValidator.js';

describe('POST /jugadores', () => {
    it('permite acceder sin JWT y valida el body', async () => {
        const respuesta = await request(app)
            .post('/jugadores')
            .send({});

        expect(respuesta.status).toBe(400);
        expect(respuesta.body.error).toBe(
            'El nombre es requerido y debe ser un texto válido'
        );
    });
});

describe('validarCrearJugador', () => {
    it('acepta un nombre válido', () => {
        const resultado = validarCrearJugador({
            nombre: 'Jugador 1'
        });

        expect(resultado).toEqual({
            valido: true
        });
    });

    it('rechaza un nombre vacío', () => {
        const resultado = validarCrearJugador({
            nombre: ''
        });

        expect(resultado.valido).toBe(false);
        expect(resultado.error).toBe(
            'El nombre es requerido y debe ser un texto válido'
        );
    });

    it('rechaza la ausencia del nombre', () => {
        const resultado = validarCrearJugador({});

        expect(resultado.valido).toBe(false);
    });
});