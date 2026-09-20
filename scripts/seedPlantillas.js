require('dotenv').config();
const mongoose = require('mongoose');
const { sembrarPlantillas } = require('../src/data/seedPlantillas');

async function main() {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        console.error('Falta la variable de entorno MONGO_URI');
        process.exit(1);
    }

    await mongoose.connect(uri);

    const forzar = process.argv.includes('--forzar');
    const resultado = await sembrarPlantillas({ forzar });

    if (resultado.insertadas > 0) {
        console.log(`Se insertaron ${resultado.insertadas} plantillas.`);
    } else {
        console.log(
            `La coleccion ya tenia ${resultado.yaExistian} plantillas, no se insertó nada. ` +
            'Usa --forzar para reemplazarlas.'
        );
    }

    await mongoose.disconnect();
}

main().catch(error => {
    console.error('Error al sembrar plantillas:', error);
    process.exit(1);
});
