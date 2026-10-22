const db = require('../config/db');

exports.generarPlan = async (req, res) => {
  try {
    const { presupuestoMaximo, caloriasObjetivo, proteinasMin, sodioMax, alergias } = req.body;

    // Aquí ejecutas la consulta a la base de datos PostgreSQL usando db.query(...)
    // O llamas a tu algoritmo de optimización para filtrar los alimentos.

    const planCalculado = {
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

    res.json(planCalculado);
  } catch (error) {
    console.error('Error al generar el plan:', error);
    res.status(500).json({ message: 'Error interno en el servidor al generar el plan' });
  }
};