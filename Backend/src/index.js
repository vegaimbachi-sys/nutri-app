const express = require('express');
const router = express.Router();

// Como index.js ya está dentro de 'src/routes/', solo requerimos el archivo directamente con './'
const nutritionRoutes = require('./nutrition.routes');

router.use('/nutrition', nutritionRoutes); 

module.exports = router;