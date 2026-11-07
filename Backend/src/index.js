const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const pool = require('./config/db');
const runMigration = require('./config/migrate');
const swaggerSpec = require('./config/swagger');
const nutritionRoutes = require('./routes/nutrition.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/nutrition', nutritionRoutes);

app.listen(PORT, async () => {
  await runMigration();
  console.log(`Servidor activo en: http://localhost:${PORT}`);
});