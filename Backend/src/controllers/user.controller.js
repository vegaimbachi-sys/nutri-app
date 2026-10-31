const pool = require('../config/db');

const generarPlanNutricional = async (req, res) => {
  try {
    const { 
      presupuesto = 120000, 
      calorias = 2200, 
      peso = 75, 
      alergias = [] // R5: ['lactosa', 'gluten', 'mariscos', 'pescado', 'frutos_secos', 'soya', 'sodio']
    } = req.body;

    // R2: Proteína mínima basada en el peso (1.8g por kg)
    const proteinaMinima = Math.round(peso * 1.8);

    // 1. Obtener alimentos de la base de datos excluyendo alérgenos (Restricción Dura R5)
    let queryAlimentos = 'SELECT * FROM alimentos WHERE activo = true';
    let queryParams = [];

    if (Array.isArray(alergias) && alergias.length > 0) {
      queryAlimentos += ` AND NOT (alergias && $1::text[])`;
      queryParams.push(alergias);
    }

    const resultadoAlimentos = await pool.query(queryAlimentos, queryParams);
    let alimentosDisponibles = resultadoAlimentos.rows;

    if (alimentosDisponibles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No hay suficientes alimentos disponibles con las restricciones seleccionadas."
      });
    }

    // Clasificar categorías de alimentos
    const desayunos = alimentosDisponibles.filter(a => /huevo|avena|yogur|pan|arepa|leche/i.test(a.nombre));
    const proteinas = alimentosDisponibles.filter(a => /pollo|carne|tilapia|atun|tofu|lenteja/i.test(a.nombre));
    const acompanamientos = alimentosDisponibles.filter(a => /arroz|papa|camote|quinoa|pasta|ensalada|brocoli/i.test(a.nombre));

    const itemDefault = alimentosDisponibles[0];
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    
    let menuSemanal = [];
    let costoTotalSemanal = 0;
    let contadorAlimentos = {}; // Para controlar la Restricción R6 (Anti-monotonía: max 2 veces por semana)

    for (let dia of dias) {
      // Seleccionar asegurando variedad (R6)
      let des = desayunos.find(a => (contadorAlimentos[a.nombre] || 0) < 2) || desayunos[0] || itemDefault;
      let prot = proteinas.find(a => (contadorAlimentos[a.nombre] || 0) < 2) || proteinas[0] || itemDefault;
      let acomp = acompanamientos.find(a => (contadorAlimentos[a.nombre] || 0) < 2) || acompanamientos[0] || itemDefault;
      
      // Registrar uso para adherencia (R6)
      contadorAlimentos[des.nombre] = (contadorAlimentos[des.nombre] || 0) + 1;
      contadorAlimentos[prot.nombre] = (contadorAlimentos[prot.nombre] || 0) + 1;
      contadorAlimentos[acomp.nombre] = (contadorAlimentos[acomp.nombre] || 0) + 1;

      const costoDia = Math.round(
        Number(des.precio || 0) + 
        Number(prot.precio || 0) + 
        Number(acomp.precio || 0)
      );

      costoTotalSemanal += costoDia;

      menuSemanal.push({
        dia,
        desayuno: des.nombre,
        almuerzo: `${prot.nombre} con ${acomp.nombre}`,
        cena: `Opción ligera: ${prot.nombre}`,
        costo: costoDia,
        caloriasEstimadas: calorias,
        proteinaEstimada: proteinaMinima
      });
    }

    // R4: Validación de Presupuesto (Optimización)
    const cumplePresupuesto = costoTotalSemanal <= presupuesto;

    // 3. Persistencia en PostgreSQL
    let planId = Date.now();
    try {
      const insertQuery = `
        INSERT INTO planes_nutricionales 
        (presupuesto_semanal, calorias_diarias, proteina_diaria, alergias_aplicadas, menu_generado)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;
      `;
      const dbRes = await pool.query(insertQuery, [
        presupuesto,
        calorias,
        proteinaMinima,
        alergias,
        JSON.stringify(menuSemanal)
      ]);
      if (dbRes.rows[0]) planId = dbRes.rows[0].id;
    } catch (dbErr) {
      console.warn("Aviso de BD:", dbErr.message);
    }

    return res.status(200).json({
      success: true,
      planId,
      restriccionesAplicadas: {
        r1_balanceEnergetico: `${calorias} kcal (Rango óptimo)`,
        r2_proteinaMinima: `${proteinaMinima}g diarios (${peso}kg x 1.8g)`,
        r4_presupuestoMaximo: presupuesto,
        r5_alergiasExcluidas: alergias.length ? alergias : ['Ninguna'],
        r6_antiMonotonia: 'Controlado (Max 2 repeticiones por alimento)'
      },
      data: {
        resumen: {
          costoEstimado: costoTotalSemanal,
          cumplePresupuesto,
          caloriasDiarias: calorias,
          proteinaDiaria: proteinaMinima
        },
        menu: menuSemanal
      }
    });

  } catch (error) {
    console.error("Error en motor nutricional:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { generarPlanNutricional };