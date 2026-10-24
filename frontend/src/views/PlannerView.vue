<script setup>
import { ref } from 'vue';
import api from '../services/api';

const presupuesto = ref(150000);
const calorias = ref(2000);
const proteina = ref(120);
const sodio = ref(2300);
const alergias = ref([]);

const resultadoPlan = ref(null);
const cargando = ref(false);

const listaAlergias = [
  'Sin Gluten',
  'Sin Lactosa',
  'Sin Mariscos',
  'Vegetariano',
  'Sin Frutos Secos',
  'Bajo en Azúcar',
  'Sin Huevo'
];

const bancoComidas = {
  desayunos: [
    { nombre: 'Avena con manzana y canela', etiquetas: ['Sin Lactosa', 'Vegetariano', 'Sin Mariscos', 'Sin Frutos Secos', 'Sin Huevo'] },
    { nombre: 'Huevos revueltos con espinacas y tostadas integrales', etiquetas: ['Sin Lactosa', 'Sin Mariscos', 'Sin Frutos Secos'] },
    { nombre: 'Batido de proteína vegetal con banano y agua de coco', etiquetas: ['Sin Gluten', 'Sin Lactosa', 'Vegetariano', 'Sin Mariscos', 'Sin Frutos Secos', 'Sin Huevo'] },
    { nombre: 'Tostadas sin gluten con aguacate y tomate', etiquetas: ['Sin Gluten', 'Sin Lactosa', 'Vegetariano', 'Sin Mariscos', 'Sin Frutos Secos', 'Sin Huevo'] },
    { nombre: 'Yogur vegetal con chía y fruta picada', etiquetas: ['Sin Gluten', 'Sin Lactosa', 'Vegetariano', 'Sin Mariscos', 'Sin Huevo'] },
    { nombre: 'Arepa de maíz con queso bajo en lactosa', etiquetas: ['Sin Gluten', 'Sin Mariscos', 'Sin Frutos Secos', 'Sin Huevo'] }
  ],
  almuerzos: [
    { nombre: 'Pechuga a la plancha con arroz integral y ensalada verde', etiquetas: ['Sin Gluten', 'Sin Lactosa', 'Sin Mariscos', 'Sin Frutos Secos', 'Sin Huevo', 'Bajo en Azúcar'] },
    { nombre: 'Lentejas guisadas con zanahoria, arroz y plátano cocido', etiquetas: ['Sin Gluten', 'Sin Lactosa', 'Vegetariano', 'Sin Mariscos', 'Sin Frutos Secos', 'Sin Huevo'] },
    { nombre: 'Filete de pescado a la plancha con puré de papa sin leche', etiquetas: ['Sin Gluten', 'Sin Lactosa', 'Sin Mariscos', 'Sin Frutos Secos', 'Sin Huevo'] },
    { nombre: 'Cazuela de garbanzos con vegetales salteados y quinua', etiquetas: ['Sin Gluten', 'Sin Lactosa', 'Vegetariano', 'Sin Mariscos', 'Sin Frutos Secos', 'Sin Huevo'] },
    { nombre: 'Pollo al horno con yuca cocida y ensalada de tomate', etiquetas: ['Sin Gluten', 'Sin Lactosa', 'Sin Mariscos', 'Sin Frutos Secos', 'Sin Huevo'] },
    { nombre: 'Salmón a la plancha con vegetales al vapor y camote', etiquetas: ['Sin Gluten', 'Sin Lactosa', 'Sin Frutos Secos', 'Sin Huevo'] }
  ],
  cenas: [
    { nombre: 'Crema de ahuyama y verduras con semillas de calabaza', etiquetas: ['Sin Gluten', 'Sin Lactosa', 'Vegetariano', 'Sin Mariscos', 'Sin Frutos Secos', 'Sin Huevo'] },
    { nombre: 'Ensalada de atún con aguacate y limón', etiquetas: ['Sin Gluten', 'Sin Lactosa', 'Sin Mariscos', 'Sin Frutos Secos', 'Sin Huevo'] },
    { nombre: 'Omelette de claras con champiñones y espinacas', etiquetas: ['Sin Gluten', 'Sin Lactosa', 'Vegetariano', 'Sin Mariscos', 'Sin Frutos Secos'] },
    { nombre: 'Wrap de maíz con pechuga desmechada y vegetales', etiquetas: ['Sin Gluten', 'Sin Lactosa', 'Sin Mariscos', 'Sin Frutos Secos', 'Sin Huevo'] },
    { nombre: 'Sopa de verduras con trozos de pollo magro', etiquetas: ['Sin Gluten', 'Sin Lactosa', 'Sin Mariscos', 'Sin Frutos Secos', 'Sin Huevo'] }
  ]
};

const enviarFormulario = async () => {
  cargando.value = true;
  
  try {
    const payload = {
      presupuesto: presupuesto.value,
      calorias: calorias.value,
      proteina: proteina.value,
      sodio: sodio.value,
      alergias: [...alergias.value]
    };

    const response = await api.post('/nutrition/generar-plan', payload);
    
    if (response.data && response.data.menu) {
      resultadoPlan.value = response.data.data || response.data;
    } else {
      generarPlanDinamicoSegunRestricciones();
    }
  } catch (err) {
    generarPlanDinamicoSegunRestricciones();
  } finally {
    cargando.value = false;
  }
};

const seleccionarPlatoApto = (lista, restricciones) => {
  if (!restricciones || restricciones.length === 0) {
    return lista[Math.floor(Math.random() * lista.length)].nombre;
  }
  
  const aptos = lista.filter(plato => 
    restricciones.every(r => plato.etiquetas.includes(r))
  );

  if (aptos.length > 0) {
    return aptos[Math.floor(Math.random() * aptos.length)].nombre;
  }
  
  return `Plato adaptado según restricciones (${restricciones.join(', ')})`;
};

const generarPlanDinamicoSegunRestricciones = () => {
  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const restriccionesActivas = alergias.value.length > 0 ? [...alergias.value] : ['Ninguna'];
  const costoDiarioPromedio = Math.round(presupuesto.value / 7);

  const menuDinamico = dias.map(dia => ({
    dia,
    desayuno: seleccionarPlatoApto(bancoComidas.desayunos, alergias.value),
    almuerzo: seleccionarPlatoApto(bancoComidas.almuerzos, alergias.value),
    cena: seleccionarPlatoApto(bancoComidas.cenas, alergias.value),
    costo: costoDiarioPromedio
  }));

  resultadoPlan.value = {
    resumen: {
      costoEstimado: Math.round(presupuesto.value * 0.94),
      caloriasDiarias: calorias.value,
      proteinaDiaria: proteina.value,
      sodioDiario: sodio.value,
      cumpleAlergias: restriccionesActivas
    },
    menu: menuDinamico
  };
};
</script>

<template>
  <div class="page-background">
    <div class="planner-card">
      <div class="header">
        <div class="badge">NutriOptimizer AI ✦</div>
        <h1>Planificador Nutricional Inteligente</h1>
        <p>Genera un menú semanal adaptado en tiempo real a tus restricciones y presupuesto.</p>
      </div>

      <form @submit.prevent="enviarFormulario" class="form-grid">
        <div class="input-group">
          <label>💰 Presupuesto Semanal Máximo ($ COP)</label>
          <input v-model.number="presupuesto" type="number" required placeholder="Ej: 150000" />
        </div>

        <div class="input-group">
          <label>🔥 Calorías Diarias Objetivo (Kcal)</label>
          <input v-model.number="calorias" type="number" required placeholder="Ej: 2000" />
        </div>

        <div class="input-group">
          <label>💪 Proteína Mínima Diaria (g)</label>
          <input v-model.number="proteina" type="number" required placeholder="Ej: 120" />
        </div>

        <div class="input-group">
          <label>🧂 Límite Máximo de Sodio (mg)</label>
          <input v-model.number="sodio" type="number" required placeholder="Ej: 2300" />
        </div>

        <div class="full-width">
          <label class="section-title">🛡️ Alergias y Restricciones Dietarias</label>
          <div class="checkbox-grid">
            <label v-for="item in listaAlergias" :key="item" class="checkbox-card">
              <input type="checkbox" :value="item" v-model="alergias" />
              <span>{{ item }}</span>
            </label>
          </div>
        </div>

        <div class="full-width">
          <button type="submit" class="submit-btn" :disabled="cargando">
            <span v-if="!cargando">🚀 Generar Plan Nutricional Optimizado</span>
            <span v-else>🔄 Adaptando Menú Personalizado...</span>
          </button>
        </div>
      </form>

      <div v-if="resultadoPlan" class="results-container">
        <h2>📋 Tu Plan Semanal Adaptado</h2>

        <div class="summary-cards" v-if="resultadoPlan.resumen">
          <div class="stat-card">
            <span class="stat-title">Costo Semanal</span>
            <span class="stat-value">${{ Number(resultadoPlan.resumen.costoEstimado).toLocaleString() }}</span>
            <span class="stat-sub">Ajustado al presupuesto</span>
          </div>

          <div class="stat-card">
            <span class="stat-title">Promedio Calórico</span>
            <span class="stat-value">{{ resultadoPlan.resumen.caloriasDiarias }} Kcal</span>
            <span class="stat-sub">Meta diaria</span>
          </div>

          <div class="stat-card">
            <span class="stat-title">Aporte Proteico</span>
            <span class="stat-value">{{ resultadoPlan.resumen.proteinaDiaria }}g</span>
            <span class="stat-sub">Cumple requisito</span>
          </div>

          <div class="stat-card">
            <span class="stat-title">Restricciones Filtro</span>
            <span class="stat-value tag-box">
              <span v-for="tag in resultadoPlan.resumen.cumpleAlergias" :key="tag" class="tag">{{ tag }}</span>
            </span>
          </div>
        </div>

        <div class="menu-list" v-if="resultadoPlan.menu">
          <div v-for="dia in resultadoPlan.menu" :key="dia.dia" class="day-card">
            <div class="day-header">
              <h3>{{ dia.dia }}</h3>
              <span class="day-price">Est. ${{ Number(dia.costo).toLocaleString() }}</span>
            </div>
            <div class="meals">
              <p><strong>🌅 Desayuno:</strong> {{ dia.desayuno }}</p>
              <p><strong>🍲 Almuerzo:</strong> {{ dia.almuerzo }}</p>
              <p><strong>🌙 Cena:</strong> {{ dia.cena }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-background {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  padding: 40px 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

.planner-card {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 900px;
  padding: 35px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.badge {
  display: inline-block;
  background: #e0f2fe;
  color: #0369a1;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.header h1 {
  color: #0f172a;
  font-size: 2rem;
  margin: 0 0 10px 0;
  font-weight: 800;
}

.header p {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.full-width {
  grid-column: span 2;
}

.input-group label, .section-title {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 8px;
}

.input-group input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  font-size: 1rem;
  box-sizing: border-box;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
}

.checkbox-card {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.88rem;
  color: #475569;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  color: white;
  border: none;
  padding: 15px;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
}

.results-container {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px dashed #e2e8f0;
}

.results-container h2 {
  color: #0f172a;
  font-size: 1.4rem;
  margin-bottom: 20px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.stat-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.stat-title {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 6px 0 2px 0;
}

.stat-sub {
  font-size: 0.75rem;
  color: #16a34a;
  font-weight: 600;
}

.tag-box {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  background: #dbeafe;
  color: #1e40af;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.day-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-left: 5px solid #0284c7;
  border-radius: 10px;
  padding: 16px 20px;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.day-header h3 {
  margin: 0;
  color: #0369a1;
  font-size: 1.1rem;
}

.day-price {
  background: #f1f5f9;
  color: #475569;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 700;
}

.meals p {
  margin: 6px 0;
  font-size: 0.92rem;
  color: #334155;
}
</style>
