# SecureWay — Analista de Seguridad

Juego web donde el jugador analiza correos y logs sospechosos y decide qué acción tomar. Cada decisión afecta la seguridad, reputación y dinero de la empresa.

Proyecto para la Materia .NET — UTEC.

## Integrantes
- Camilo
- Iñaki
- Juan

## Tecnologías

**Backend** (este repo)
- Node.js + Express
- MongoDB + Mongoose
- JWT para autenticación
- Vitest + Supertest + mongodb-memory-server para tests

**Frontend**
- React + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- [`CyberSecuritySimulatorFrontend`](https://github.com/camilo0o/CyberSecuritySimulatorFrontend)

## Cómo correrlo

```bash
git clone https://github.com/camilo0o/CyberSecuritySimulator.git
cd CyberSecuritySimulator
npm install
cp .env.example .env
```

Completar `.env` con tu URI de MongoDB (Atlas o local) y un `JWT_SECRET`.

Sembrar el banco de plantillas de tickets (correos + logs) que se usan para generar las actividades de cada partida:

```bash
npm run seed
```

Levantar el servidor:

```bash
npm run dev
```

Corre en `http://localhost:3000`.

## Tests

```bash
npm test
```

Usa `mongodb-memory-server`, así que no hace falta una base de datos real para correrlos — levanta un Mongo en memoria por archivo de test.

## Autenticación

Todas las rutas salvo `/jugadores/registro` y `/jugadores/login` requieren un JWT en el header:

```
Authorization: Bearer <token>
```

El token se obtiene al registrarse o iniciar sesión, dura 2 horas, y su payload es:

```json
{ "sub": "<jugadorId>", "tokenVersion": 0 }
```

`tokenVersion` es la pieza clave: al hacer logout se incrementa en la base de datos, y como el middleware de autenticación compara el `tokenVersion` del token contra el que tiene el jugador guardado, **cualquier token emitido antes del logout queda inválido de inmediato**, aunque todavía no haya expirado. No es un logout "de mentira" del lado del cliente.

## Formato de errores

Todas las respuestas de error tienen esta forma:

```json
{ "error": "mensaje descriptivo" }
```

Los códigos de estado más comunes: `400` (datos inválidos), `401` (sin token / token inválido / sesión cerrada), `404` (recurso no encontrado o no pertenece al jugador), `409` (conflicto: acción ya realizada o partida ya finalizada).

---

## Endpoints

### Jugadores — `/jugadores`

#### `POST /jugadores/registro`
Crea un jugador nuevo. No requiere token.

Body:
```json
{ "nombre": "juane", "email": "juane@test.com", "password": "clave123" }
```

- `password` debe tener al menos 6 caracteres.
- `email` debe tener formato válido.

Respuesta `201`:
```json
{
  "jugador": { "_id": "...", "nombre": "juane", "email": "juane@test.com", "empresaId": null, "tokenVersion": 0 },
  "token": "<JWT>"
}
```

Errores: `400` si falta o es inválido algún campo · `409` si el email ya está registrado.

#### `POST /jugadores/login`
No requiere token.

Body:
```json
{ "email": "juane@test.com", "password": "clave123" }
```

Respuesta `200`: igual forma que el registro (`{ jugador, token }`).

Errores: `400` si falta email o password · `401` con `"Credenciales inválidas"` si no coinciden.

#### `POST /jugadores/logout`
Requiere token. Invalida el token actual (y cualquier otro emitido antes) incrementando `tokenVersion`.

Respuesta `200`:
```json
{ "mensaje": "Sesión cerrada" }
```

---

### Empresas / partida — `/empresas`

Una "empresa" es la partida en curso del jugador. Cada jugador tiene una sola empresa activa a la vez (`Jugador.empresaId`).

#### `POST /empresas`
Inicia una partida nueva para el jugador autenticado. Genera automáticamente el primer ticket (turno 1).

Respuesta `201`:
```json
{
  "_id": "...",
  "seguridad": 100,
  "reputacion": 100,
  "dinero": 10000,
  "turno": 1,
  "maxTurnos": 10,
  "estado": "activa"
}
```

#### `GET /empresas/:id`
Devuelve el estado actual de la empresa (mismos campos que arriba).

Errores: `404` si la empresa no existe o no pertenece al jugador autenticado.

#### `GET /empresas/:id/actividades`
Lista los tickets de la partida. Filtro opcional por estado: `?estado=pendiente|resuelta|ignorada`.

Respuesta `200`:
```json
{ "actividades": [ /* ver forma de un ticket más abajo */ ] }
```

Errores: `400` con `"Estado de actividad invalido"` si el filtro no es uno de los tres válidos · `404` si la empresa no es del jugador.

#### `POST /empresas/:id/avanzar`
Cierra el turno actual: los tickets que quedaron `pendiente` pasan a `ignorada` y penalizan seguridad/reputación/dinero en proporción a su `nivelRiesgo`. Si no se cumplieron las condiciones de derrota (alguna métrica en 0) ni se superó `maxTurnos`, genera 1 ticket nuevo para el turno siguiente.

Respuesta `200`:
```json
{
  "empresa": { "...": "estado actualizado de la empresa" },
  "actividades": [ /* los tickets nuevos del turno siguiente, [] si la partida terminó */ ],
  "pendientesPenalizadas": 1
}
```

Si la partida termina (por métricas en 0 o por agotar los turnos), `empresa.estado` pasa a `"derrota"` o `"victoria"` y se guarda una entrada en el historial automáticamente. El `turno` nunca queda por encima de `maxTurnos`, ni siquiera al ganar en el último turno.

Errores: `400` con id inválido · `404` si la empresa no es del jugador · `409` con `"La partida ya finalizo"` si ya estaba terminada.

#### `POST /empresas/:id/rendirse`
Termina la partida en curso como `"derrota"` de forma voluntaria, sin esperar a que las métricas lleguen a 0. Registra la entrada en el historial igual que un fin de partida normal.

Respuesta `200`:
```json
{ "empresa": { "...": "estado final, con estado: \"derrota\"" } }
```

Errores: `400` con id inválido · `404` si la empresa no es del jugador · `409` con `"La partida ya finalizo"` si ya estaba terminada.

---

### Actividades / tickets — `/actividades`

Forma completa de un ticket (la misma tanto en el listado como en el detalle):

```json
{
  "_id": "...",
  "jugadorId": "...",
  "turno": 1,
  "descripcion": "Correo sospechoso de soporte",
  "dificultad": "media",
  "nivelRiesgo": 75,
  "esMalicioso": true,
  "estado": "pendiente",
  "correo": {
    "titulo": "Actualiza tu contraseña",
    "remitente": "soporte@seguridad-falsa.com",
    "destinatario": "empleado@empresa.com",
    "contenido": "Necesitamos verificar tu cuenta.",
    "tieneAdjunto": false,
    "nombreAdjunto": null,
    "enlace": "https://seguridad-falsa.com/login"
  },
  "logs": [
    {
      "archivo": "mail.log",
      "hora": "08:41:12",
      "contenido": "mx01 postfix/smtpd: from=<soporte@seguridad-falsa.com> ip=203.0.113.10 spf=FAIL",
      "direccionIp": "203.0.113.10",
      "ubicacion": null,
      "dispositivo": null,
      "usuario": null,
      "tipoAcceso": null
    }
  ]
}
```

> `esMalicioso` y `nivelRiesgo` viajan siempre, incluso con el ticket todavía `pendiente` — la API no oculta esa información hoy. `archivo` solo puede ser uno de `mail.log`, `auth.log`, `proxy.log` o `sandbox.log`. Cada ticket tiene al menos un log.

#### `GET /actividades/:id`
Devuelve el ticket completo (forma de arriba).

Errores: `400` con id inválido · `404` con `"Actividad no encontrada"` si no existe o no es del jugador.

#### `POST /actividades/:id/resolver`
Resuelve un ticket pendiente.

Body:
```json
{ "accion": "bloquear" }
```

`accion` debe ser `"bloquear"` o `"permitir"`.

Respuesta `200`:
```json
{
  "actividad": { "...": "el ticket, ya con estado: \"resuelta\"" },
  "empresa": { "...": "estado actualizado de la empresa" },
  "correcta": true,
  "esMaliciosa": true,
  "impacto": { "seguridad": 75, "reputacion": 37, "dinero": -150 }
}
```

La decisión es correcta si bloqueás algo malicioso o permitís algo legítimo. Bloquear algo legítimo o permitir algo malicioso penaliza. El impacto se aplica de forma atómica junto con el cambio de estado del ticket.

Errores: `400` si `accion` no es válida o el id es inválido · `404` si el ticket no existe o no es del jugador (o si el jugador no tiene empresa asociada) · `409` con `"La actividad ya fue resuelta"` si ya no está pendiente.

---

### Historial — `/historial`

#### `GET /historial/ranking`
Ranking global de todas las partidas que terminaron (de cualquier jugador), ordenado por seguridad final, después reputación, después dinero, después fecha.

Respuesta `200`:
```json
{
  "ranking": [
    {
      "posicion": 1,
      "_id": "...",
      "jugadorId": "...",
      "empresaId": "...",
      "nombreJugador": "juane",
      "seguridadFinal": 100,
      "reputacionFinal": 90,
      "dineroFinal": 8400,
      "createdAt": "2026-09-20T12:00:00.000Z"
    }
  ]
}
```

Es un ranking global, no el historial de partidas de un jugador en particular — hoy no existe un endpoint para eso.
