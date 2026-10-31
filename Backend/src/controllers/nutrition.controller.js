const pool = require('../config/db');

// Función auxiliar para seleccionar un elemento aleatorio de un arreglo
const obtenerAleatorio = (arr, fallback) => {
  if (!arr || arr.length === 0) return fallback;
  return arr[Math.floor(Math.random() * arr.length)];
};

const generarPlanNutricional = async (req, res) => {
  try {
    const { presupuesto, calorias, proteina, sodio, alergias } = req.body;

    // 1. Consultar alimentos que NO contengan las alergias seleccionadas
    let queryAlimentos = 'SELECT * FROM alimentos WHERE activo = true';
    let queryParams = [];

    if (alergias && alergias.length > 0) {
      queryAlimentos += ` AND NOT (alergias && $1::text[])`;
      queryParams.push(alergias);
    }

    const resultadoAlimentos = await pool.query(queryAlimentos, queryParams);
    const alimentosDisponibles = resultadoAlimentos.rows;

    if (alimentosDisponibles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron alimentos en la base de datos con esas restricciones."
      });
    }

    // 2. Categorizar alimentos por palabras clave para hacer combinaciones coherentes
    const desayunos = alimentosDisponibles.filter(a => 
      a.nombre.toLowerCase().includes('huevos') || 
      a.nombre.toLowerCase().includes('avena') || 
      a.nombre.toLowerCase().includes('yogur') || 
      a.nombre.toLowerCase().includes('pan') ||
      a.nombre.toLowerCase().includes('arepa')
    );

    const proteinas = alimentosDisponibles.filter(a => 
      a.nombre.toLowerCase().includes('pollo') || 
      a.nombre.toLowerCase().includes('carne') || 
      a.nombre.toLowerCase().includes('tilapia') || 
      a.nombre.toLowerCase().includes('pescado') || 
      a.nombre.toLowerCase().includes('camarones') ||
      a.nombre.toLowerCase().includes('atún') ||
      a.nombre.toLowerCase().includes('tofu') ||
      a.nombre.toLowerCase().includes('lentejas')
    );

    const acompañamientos = alimentosDisponibles.filter(a => 
      a.nombre.toLowerCase().includes('arroz') || 
      a.nombre.toLowerCase().includes('papa') || 
      a.nombre.toLowerCase().includes('camote') || 
      a.nombre.toLowerCase().includes('quinoa') || 
      a.nombre.toLowerCase().includes('pastas') ||
      a.nombre.toLowerCase().includes('ensalada') ||
      a.nombre.toLowerCase().includes('brócoli') ||
      a.nombre.toLowerCase().includes('espinacas')
    );

    // Alimentos comodín por si alguna categoría queda vacía tras los filtros de alergias
    const fallbackItem = alimentosDisponibles[0];

    // 3. Generar menú de los 7 días de la semana
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    const menuSemanal = dias.map(dia => {
      const itemDesayuno = obtenerAleatorio(desayunos, fallbackItem);
      const itemProteina = obtenerAleatorio(proteinas, fallbackItem);
      const itemAcompañamiento = obtenerAleatorio(acompañamientos, fallbackItem);
      const itemCena = obtenerAleatorio(proteinas.length > 0 ? proteinas : desayunos, fallbackItem);

      const costoDia = Math.round(
        Number(itemDesayuno.precio) + 
        Number(itemProteina.precio) + 
        Number(itemAcompañamiento.precio) + 
        Number(itemCena.precio)
      );

      return {
        dia,
        desayuno: itemDesayuno.nombre,
        almuerzo: `${itemProteina.nombre} con ${itemAcompañamiento.nombre}`,
        cena: `Opción ligera: ${itemCena.nombre}`,
        costo: costoDia
      };
    });

    const costoTotalSemanal = menuSemanal.reduce((acc, el) => acc + el.costo, 0);

    const resumenData = {
      costoEstimado: costoTotalSemanal,
      caloriasDiarias: calorias,
      proteinaDiaria: proteina,
      sodioDiario: sodio,
      cumpleAlergias: alergias && alergias.length > 0 ? alergias : ['Ninguna']
    };

    // 4. PERSISTENCIA: Guardar el plan generado en PostgreSQL
    const insertQuery = `
      INSERT INTO planes_nutricionales 
      (presupuesto_semanal, calorias_diarias, proteina_diaria, sodio_diario, alergias_aplicadas, menu_generado)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, creado_en;
    `;

    const insertValues = [
      presupuesto,
      calorias,
      proteina,
      sodio,
      alergias || [],
      JSON.stringify(menuSemanal)
    ];

    const planGuardado = await pool.query(insertQuery, insertValues);

    // 5. Enviar respuesta al cliente
    return res.status(200).json({
      success: true,
      planId: planGuardado.rows[0].id,
      creadoEn: planGuardado.rows[0].creado_en,
      data: {
        resumen: resumenData,
        menu: menuSemanal
      }
    });

  } catch (error) {
    console.error("Error en generarPlanNutricional:", error);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor al procesar la solicitud."
    });
  }
};

module.exports = {
  generarPlanNutricional
};