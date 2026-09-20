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
import { validarLogin, validarRegistro } from '../src/validators/jugadorValidator.js';

const secreto = 'secreto-de-prueba';
const datosValidos = {
    nombre: 'Jugador 1',
    email: 'jugador1@test.com',
    password: 'clave123'
};
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

beforeEach(() => {
    process.env.JWT_SECRET = secreto;
});

afterEach(async () => {
    await Jugador.deleteMany({});
});

afterAll(async () => {
    await mongoose.disconnect();
    await replSet.stop();
});

describe('POST /jugadores/registro', () => {
    it('registra un jugador y devuelve el token sin exponer el password', async () => {
        const respuesta = await request(app)
            .post('/jugadores/registro')
            .send(datosValidos);

        expect(respuesta.status).toBe(201);
        expect(respuesta.body.token).toBeTruthy();
        expect(respuesta.body.jugador.email).toBe('jugador1@test.com');
        expect(respuesta.body.jugador).not.toHaveProperty('password');
    });

    it('guarda el password hasheado', async () => {
        await request(app).post('/jugadores/registro').send(datosValidos);

        const jugador = await Jugador.findOne({ email: 'jugador1@test.com' });

        expect(jugador.password).not.toBe('clave123');
    });

    it('rechaza un email ya registrado', async () => {
        await request(app).post('/jugadores/registro').send(datosValidos);

        const respuesta = await request(app)
            .post('/jugadores/registro')
            .send(datosValidos);

        expect(respuesta.status).toBe(409);
        expect(respuesta.body.error).toBe('Ya existe un jugador con ese email');
    });

    it('valida el body antes de registrar', async () => {
        const respuesta = await request(app)
            .post('/jugadores/registro')
            .send({});

        expect(respuesta.status).toBe(400);
        expect(respuesta.body.error).toBe('El nombre es requerido');
    });
});

describe('POST /jugadores/login', () => {
    it('inicia sesion con credenciales correctas', async () => {
        await request(app).post('/jugadores/registro').send(datosValidos);

        const respuesta = await request(app)
            .post('/jugadores/login')
            .send({ email: datosValidos.email, password: datosValidos.password });

        expect(respuesta.status).toBe(200);
        expect(respuesta.body.token).toBeTruthy();
    });

    it('rechaza una contrasena incorrecta', async () => {
        await request(app).post('/jugadores/registro').send(datosValidos);

        const respuesta = await request(app)
            .post('/jugadores/login')
            .send({ email: datosValidos.email, password: 'otra-clave' });

        expect(respuesta.status).toBe(401);
        expect(respuesta.body.error).toBe('Credenciales inválidas');
    });
});

describe('POST /jugadores/logout', () => {
    it('invalida el token despues de cerrar sesion', async () => {
        const registro = await request(app)
            .post('/jugadores/registro')
            .send(datosValidos);
        const { token } = registro.body;

        const logout = await request(app)
            .post('/jugadores/logout')
            .set('Authorization', `Bearer ${token}`);

        expect(logout.status).toBe(200);

        const reuso = await request(app)
            .get('/')
            .set('Authorization', `Bearer ${token}`);

        expect(reuso.status).toBe(401);
        expect(reuso.body.error).toBe('Sesión inválida o cerrada');
    });
});

describe('validarRegistro', () => {
    it('acepta datos validos', () => {
        expect(validarRegistro(datosValidos)).toEqual({ valido: true });
    });

    it('rechaza un email sin arroba', () => {
        const resultado = validarRegistro({ ...datosValidos, email: 'sin-arroba' });

        expect(resultado.valido).toBe(false);
        expect(resultado.error).toBe('Email inválido');
    });

    it('rechaza una contrasena de menos de 6 caracteres', () => {
        const resultado = validarRegistro({ ...datosValidos, password: '123' });

        expect(resultado.valido).toBe(false);
        expect(resultado.error).toBe('La contraseña debe tener al menos 6 caracteres');
    });
});

describe('validarLogin', () => {
    it('exige email y contrasena', () => {
        expect(validarLogin({ email: 'a@b.com' }).valido).toBe(false);
        expect(validarLogin({ email: 'a@b.com', password: 'x' }).valido).toBe(true);
    });
});
