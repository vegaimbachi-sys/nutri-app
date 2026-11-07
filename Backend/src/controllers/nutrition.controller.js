const pool = require('../config/db');

exports.generarPlan = async (req, res) => {
  try {
    const { peso, presupuesto, calorias, alergias = [] } = req.body;

    const result = await pool.query('SELECT * FROM alimentos');
    console.log("Registros encontrados en DB:", result.rows.length);
    let alimentosDisponibles = result.rows;

    if (alimentosDisponibles.length === 0) {
      return res.status(400).json({ success: false, message: 'La tabla alimentos está vacía o se consultó otra base de datos.' });
    }

    if (alergias.length > 0) {
      alimentosDisponibles = alimentosDisponibles.filter(item => {
        if (!item.alergias) return true;
        let itemAlergias = Array.isArray(item.alergias) 
          ? item.alergias 
          : item.alergias.replace(/[{}]/g, '').split(',').map(a => a.trim());
        return !itemAlergias.some(alergia => alergias.includes(alergia));
      });
    }

    const proteinaDiaria = Math.round(peso * 2.0);
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    let menu = [];
    let costoEstimadoTotal = 0;

    for (let i = 0; i < diasSemana.length; i++) {
      const desayuno = alimentosDisponibles[i % alimentosDisponibles.length];
      const almuerzo = alimentosDisponibles[(i + 1) % alimentosDisponibles.length];
      const cena = alimentosDisponibles[(i + 2) % alimentosDisponibles.length];

      const costoDia = Number(desayuno.precio || 0) + Number(almuerzo.precio || 0) + Number(cena.precio || 0);
      costoEstimadoTotal += costoDia;

      menu.push({
        dia: diasSemana[i],
        costo: costoDia,
        desayuno: `${desayuno.nombre} - ${desayuno.calorias || 0} kcal`,
        almuerzo: `${almuerzo.nombre} - ${almuerzo.calorias || 0} kcal`,
        cena: `${cena.nombre} - ${cena.calorias || 0} kcal`
      });
    }

    const cumplePresupuesto = costoEstimadoTotal <= (presupuesto || 999999);
    const planIdGenerado = Math.floor(Math.random() * 90000) + 10000;

    return res.json({
      success: true,
      planId: planIdGenerado,
      data: {
        resumen: {
          costoEstimado: costoEstimadoTotal,
          cumplePresupuesto: cumplePresupuesto,
          proteinaDiaria: proteinaDiaria
        },
        menu: menu
      }
    });

  } catch (error) {
    console.error('Error detallado en DB:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};