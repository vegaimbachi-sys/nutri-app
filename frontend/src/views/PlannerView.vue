<template>
  <MainLayout>
    <div class="card">
      <h2>Planificador Nutricional</h2>
      <p class="subtitle">Calcula el menú semanal más económico según tus requisitos</p>

      <form @submit.prevent="generarPlan" class="form-grid">
        <div class="form-group">
          <label>Presupuesto Semanal Máximo ($):</label>
          <input v-model.number="form.presupuestoMaximo" type="number" required />
        </div>

        <div class="form-group">
          <label>Calorías Diarias Objetivo (Kcal):</label>
          <input v-model.number="form.caloriasObjetivo" type="number" required />
        </div>

        <div class="form-group">
          <label>Proteína Mínima Diaria (g):</label>
          <input v-model.number="form.proteinasMin" type="number" required />
        </div>

        <div class="form-group">
          <label>Límite de Sodio Diario (mg):</label>
          <input v-model.number="form.sodioMax" type="number" required />
        </div>

        <div class="form-group full-width">
          <label>Alergias / Restricciones:</label>
          <div class="checkbox-group">
            <label><input type="checkbox" value="gluten" v-model="form.alergias" /> Sin Gluten</label>
            <label><input type="checkbox" value="lactosa" v-model="form.alergias" /> Sin Lactosa</label>
            <label><input type="checkbox" value="mariscos" v-model="form.alergias" /> Sin Mariscos</label>
          </div>
        </div>

        <button type="submit" class="btn" :disabled="cargando">
          {{ cargando ? 'Calculando...' : 'Generar Plan Nutricional' }}
        </button>
      </form>

      <div v-if="error" class="error-box">{{ error }}</div>

      <div v-if="resultado" class="results">
        <hr />
        <h3>Menú Semanal Optimizado</h3>
        <p class="costo-total">Costo Total Semanal: <strong>${{ resultado.costoTotal.toLocaleString() }} COP</strong></p>

        <div class="days-grid">
          <div v-for="dia in resultado.menuSemanal" :key="dia.dia" class="day-card">
            <h4>Día {{ dia.dia }}</h4>
            <span class="meta">Calorías: {{ dia.calorias }} Kcal</span>
            <p><strong>Costo:</strong> ${{ dia.costo.toLocaleString() }}</p>
            <ul>
              <li v-for="(comida, index) in dia.comidas" :key="index">
                {{ comida.nombre }} - ${{ comida.precio.toLocaleString() }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { reactive, ref } from 'vue';
import MainLayout from '../layouts/MainLayout.vue';

const form = reactive({
  presupuestoMaximo: 150000,
  caloriasObjetivo: 2000,
  proteinasMin: 120,
  sodioMax: 2300,
  alergias: []
});

const cargando = ref(false);
const resultado = ref(null);
const error = ref('');

const generarPlan = async () => {
  cargando.value = true;
  error.value = '';
  resultado.value = null;

  try {
    const res = await fetch('http://localhost:3000/api/nutrition/generar-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al conectar con la API');

    resultado.value = data;
  } catch (err) {
    error.value = err.message;
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
.card { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.subtitle { color: #64748b; margin-bottom: 1.5rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; }
.full-width { grid-column: 1 / -1; }
label { font-weight: 600; margin-bottom: 0.4rem; font-size: 0.9rem; }
input[type="number"] { padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 6px; }
.checkbox-group { display: flex; gap: 1.5rem; margin-top: 0.4rem; }
.btn { grid-column: 1 / -1; background-color: #0284c7; color: white; padding: 0.75rem; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 1rem; }
.btn:hover { background-color: #0369a1; }
.error-box { margin-top: 1rem; padding: 0.75rem; background-color: #fef2f2; color: #991b1b; border-radius: 6px; }
.results { margin-top: 2rem; }
.costo-total { font-size: 1.25rem; color: #16a34a; }
.days-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-top: 1rem; }
.day-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 1rem; border-radius: 8px; }
.meta { font-size: 0.8rem; color: #64748b; display: block; }
</style>