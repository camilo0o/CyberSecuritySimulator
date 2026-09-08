# Analista de Seguridad

Juego web donde el jugador analiza correos y logs sospechosos y decide qué acción tomar. Cada decisión afecta la seguridad, reputación y dinero de la empresa.

Proyecto para [materia] — UTEC.

## Integrantes
- Camilo
- Iñaki
- Juan

## Tecnologías
- Node.js + Express
- MongoDB + Mongoose
- [Frontend: completar cuando esté definido]

## Cómo correrlo

```bash
git clone https://github.com/camilo0o/CyberSecuritySimulator.git
cd CyberSecuritySimulator
npm install
cp .env.example .env
```

Completar `.env` con tu URI de MongoDB Atlas.

```bash
npm run dev
```

Corre en `http://localhost:3000`.

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/jugadores` | Crear jugador |
| POST | `/empresas` | Iniciar partida |
| GET | `/empresas/:id` | Ver estado de la partida |
| GET | `/empresas/:id/actividades` | Listar actividades (filtro `?estado=`) |
| GET | `/actividades/:id` | Ver detalle de una actividad |
| POST | `/actividades/:id/resolver` | Resolver actividad (`{ "accion": "bloquear" }`) |
| POST | `/empresas/:id/avanzar` | Avanzar turno |
| GET | `/historial/ranking` | Ver ranking de partidas |

## Tests (Proximamente)

```bash
npm test
```