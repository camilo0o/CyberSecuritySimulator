const express = require('express');

const jugadorRoutes = require('./routes/jugadorRoutes');
const empresaRoutes = require('./routes/empresaRoutes');
const actividadRoutes = require('./routes/actividadRoutes');

const { autenticar } = require('./middlewares/auth');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

app.use('/jugadores', jugadorRoutes);
app.use('/empresas', empresaRoutes);
app.use('/actividades', actividadRoutes);

app.get('/', autenticar, (req, res) => {
    res.json({
        status: 'ok',
        mensaje: 'API Analista de Seguridad funcionando',
        jugadorId: req.usuario.id
    });
});

app.use(errorHandler);

module.exports = app;