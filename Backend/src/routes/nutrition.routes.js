const express = require('express');
const router = express.Router();
const nutritionController = require('../controllers/nutrition.controller');

router.post('/generar-plan', nutritionController.generarPlan);

module.exports = router;