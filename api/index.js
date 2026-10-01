// Punto de entrada para Vercel. A diferencia de src/server.js (que hace
// app.listen y queda escuchando para siempre), esto se ejecuta una vez por
// request dentro de una funcion serverless. Vercel detecta automaticamente
// cualquier archivo dentro de /api como una funcion.
require('node:dns').setServers(['1.1.1.1', '8.8.8.8']);
require('dotenv').config();

const app = require('../src/app');
const connectDB = require('../src/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'No se pudo conectar a la base de datos' }));
    return;
  }

  return app(req, res);
};
