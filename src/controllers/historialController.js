const { obtenerRanking } = require('../services/historialService');

async function ranking(req, res, next) {
    try {
        const resultado = await obtenerRanking();

        res.status(200).json({
            ranking: resultado
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { ranking };