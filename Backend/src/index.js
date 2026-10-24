// Ejemplo en Backend/src/routes/index.js
const express = require('express');
const router = express.Router();
const nutritionRoutes = require('./nutrition.routes');

router.use('/nutrition', nutritionRoutes); // Esto dejará la ruta completa en /api/nutrition/generar-plan

module.exports = router;