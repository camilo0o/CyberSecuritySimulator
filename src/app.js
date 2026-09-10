const express = require('express');

const jugadorRoutes = require('./routes/jugadorRoutes');
const empresaRoutes = require('./routes/empresaRoutes');
const actividadRoutes = require('./routes/actividadRoutes');
// const historialRoutes = require('./routes/historialRoutes');

const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Middlewares globales
app.use(express.json());

// Rutas
app.use('/jugadores', jugadorRoutes);
app.use('/empresas', empresaRoutes);
app.use('/actividades', actividadRoutes);
// app.use('/historial', historialRoutes);

// Ruta de salud, útil para chequear rápido que el server responde
app.get('/', (req, res) => {
  res.json({ status: 'ok', mensaje: 'API Analista de Seguridad funcionando' });
});

// Middleware de error SIEMPRE al final, después de todas las rutas
app.use(errorHandler);

module.exports = app;