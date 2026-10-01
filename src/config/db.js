const mongoose = require('mongoose');

// En Vercel cada request puede llegar a una funcion serverless nueva, asi
// que cacheamos la conexion en una variable del modulo: si ya hay una
// conexion abierta (misma instancia "tibia"), la reusamos en vez de volver
// a conectar. Tambien evitamos process.exit(1): en una funcion serverless
// eso mataria el proceso entero en vez de devolver un error HTTP normal.
let conexion = null;

const connectDB = async () => {
  if (conexion && mongoose.connection.readyState === 1) return conexion;

  try {
    conexion = await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB conectado');
    return conexion;
  } catch (err) {
    conexion = null;
    console.error('Error conectando a MongoDB:', err.message);
    throw err;
  }
};

module.exports = connectDB;
