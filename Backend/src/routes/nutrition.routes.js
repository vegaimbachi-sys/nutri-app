const express = require('express');
const router = express.Router();

// Endpoint para generar el plan nutricional
router.post('/generar-plan', async (req, res) => {
  try {
    const { presupuestoMaximo, caloriasObjetivo, proteinasMin, sodioMax, alergias } = req.body;

    // Aquí conectaremos la lógica de la base de datos o el controlador
    // Por ahora, devolvemos una respuesta de prueba para verificar la conexión
    const planEjemplo = {
      costoTotal: 120000,
      menuSemanal: [
        {
          dia: 1,
          calorias: caloriasObjetivo || 2000,
          costo: 17142,
          comidas: [
            { nombre: 'Desayuno: Huevos con arepa', precio: 5000 },
            { nombre: 'Almuerzo: Pechuga de pollo con arroz', precio: 8000 },
            { nombre: 'Cena: Ensalada de atún', precio: 4142 }
          ]
        }
      ]
    };

    res.json(planEjemplo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al generar el plan' });
  }
});

module.exports = router;