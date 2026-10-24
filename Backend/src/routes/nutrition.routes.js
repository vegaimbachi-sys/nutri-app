const express = require('express');
const router = express.Router();
const nutritionController = require('../controllers/nutrition.controller');

// La ruta completa será /api/nutrition/generar-plan
router.post('/generar-plan', nutritionController.generarPlan);

module.exports = router;