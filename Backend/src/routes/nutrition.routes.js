const express = require('express');
const router = express.Router();
const { generarPlanNutricional } = require('../controllers/nutrition.controller');

// Ruta POST para generar y guardar el plan nutricional
router.post('/generar-plan', generarPlanNutricional);

module.exports = router;