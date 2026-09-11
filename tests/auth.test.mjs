import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it } from 'vitest';

import { crearTokenJugador } from '../src/utils/token.js';

const secreto = 'secreto-de-prueba';
const jugadorId = '507f1f77bcf86cd799439011';

describe('crearTokenJugador', () => {
    beforeEach(() => {
        process.env.JWT_SECRET = secreto;
    });

    it('crea un token con el jugador en el claim sub', () => {
        const token = crearTokenJugador(jugadorId);
        const payload = jwt.verify(token, secreto);

        expect(payload.sub).toBe(jugadorId);
    });

    it('crea un token con fecha de expiración', () => {
        const token = crearTokenJugador(jugadorId);
        const payload = jwt.verify(token, secreto);

        expect(payload.exp).toBeDefined();
        expect(payload.iat).toBeDefined();
    });

    it('falla si no existe JWT_SECRET', () => {
        delete process.env.JWT_SECRET;

        expect(() => crearTokenJugador(jugadorId)).toThrow(
            'JWT_SECRET no configurado'
        );
    });
});