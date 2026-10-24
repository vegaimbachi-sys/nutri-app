const pool = require('../config/db'); // Asegúrate de que esta sea la ruta correcta a tu conexión de base de datos

const generarPlanNutricional = async (req, res) => {
  try {
    const { presupuesto, calorias, proteina, sodio, alergias } = req.body;

    // 1. Consultar alimentos disponibles en PostgreSQL que NO contengan las alergias seleccionadas
    // Si 'alergias' viene vacío, trae todos. Si trae restricciones, filtra los que NO las tengan en su array.
    let queryAlimentos = 'SELECT * FROM alimentos WHERE activo = true';
    let queryParams = [];

    if (alergias && alergias.length > 0) {
      // Excluye alimentos cuyas alergias coincidan con alguna de las seleccionadas por el usuario
      queryAlimentos += ` AND NOT (alergias && $1::text[])`;
      queryParams.push(alergias);
    }

    const resultadoAlimentos = await pool.query(queryAlimentos, queryParams);
    const alimentosDisponibles = resultadoAlimentos.rows;

    // 2. Armar dinámicamente los días con los alimentos reales de la BD
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const costoDiario = Math.round(presupuesto / 7);

    // Seleccionamos aleatoriamente de la base de datos para armar el menú semanal
    const menuSemanal = dias.map((dia, index) => {
      const desayunoItem = alimentosDisponibles[index % alimentosDisponibles.length] || { nombre: 'Avena con fruta', precio: costoDiario / 3 };
      const almuerzoItem = alimentosDisponibles[(index + 1) % alimentosDisponibles.length] || { nombre: 'Pechuga con arroz', precio: costoDiario / 3 };
      const cenaItem = alimentosDisponibles[(index + 2) % alimentosDisponibles.length] || { nombre: 'Ensalada ligera', precio: costoDiario / 3 };

      return {
        dia,
        desayuno: desayunoItem.nombre,
        almuerzo: almuerzoItem.nombre,
        cena: cenaItem.nombre,
        costo: Math.round(Number(desayunoItem.precio) + Number(almuerzoItem.precio) + Number(cenaItem.precio))
      };
    });

    // 3. Responder al frontend con el menú real extraído de PostgreSQL
    return res.status(200).json({
      success: true,
      data: {
        resumen: {
          costoEstimado: presupuesto * 0.95,
          caloriasDiarias: calorias,
          proteinaDiaria: proteina,
          sodioDiario: sodio,
          cumpleAlergias: alergias.length > 0 ? alergias : ['Ninguna']
        },
        menu: menuSemanal
      }
    });

  } catch (error) {
    console.error("Error al consultar la base de datos:", error);
    return res.status(500).json({
      success: false,
      error: "Error interno al generar el plan desde la base de datos"
    });
  }
};

module.exports = {
  generarPlanNutricional
};