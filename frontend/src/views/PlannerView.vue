<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-500 selection:text-slate-950">
    <div class="w-full max-w-7xl mx-auto space-y-10">
      
      <!-- Encabezado -->
      <header class="text-center space-y-3">
        <div class="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-4 py-1.5 rounded-full shadow-inner">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>NutriOptimizer  • Motor Académico PostgreSQL (7 Restricciones)</span>
        </div>
        <h1 class="text-4xl sm:text-6xl font-black tracking-tight text-white">
          Planificador <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Nutricional</span>
        </h1>
        <p class="max-w-2xl mx-auto text-slate-400 text-base">
          Sistema de optimización con restricciones duras (calorías, proteína, presupuesto, alérgenos) y blandas (variedad).
        </p>
      </header>

      <!-- Layout Principal -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Panel Izquierdo: Configuración -->
        <div class="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <h2 class="text-xl font-bold text-white flex items-center space-x-3 border-b border-slate-800 pb-4">
            <span class="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">⚙️</span>
            <span>Parámetros Biométricos & Económicos</span>
          </h2>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Peso Corporal (kg) - [Calcula R2]</label>
              <input 
                type="number" 
                v-model.number="form.peso" 
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-white font-semibold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-sm shadow-inner"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Presupuesto Semanal Máximo ($ COP) - [R4]</label>
              <input 
                type="number" 
                v-model.number="form.presupuesto" 
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-white font-semibold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-sm shadow-inner"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Meta Calórica Diaria (kcal) - [R1]</label>
              <input 
                type="number" 
                v-model.number="form.calorias" 
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-white font-semibold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-sm shadow-inner"
              />
            </div>

            <!-- Las 7 Restricciones Exactas -->
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Restricciones Estrictas / Alergias (R5)</label>
              <div class="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                <label 
                  v-for="item in listaRestricciones" 
                  :key="item.valor"
                  :class="[
                    'flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer text-sm font-semibold select-none',
                    form.alergias.includes(item.valor)
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                  ]"
                >
                  <span>{{ item.etiqueta }}</span>
                  <input 
                    type="checkbox" 
                    :value="item.valor" 
                    v-model="form.alergias" 
                    class="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer" 
                  />
                </label>
              </div>
            </div>
          </div>

          <button 
            @click="generarPlan" 
            :disabled="cargando"
            class="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-slate-950 font-black tracking-wide shadow-lg shadow-emerald-500/20 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-base"
          >
            <span v-if="!cargando">Optimizar Menú Semanal</span>
            <span v-else class="flex items-center space-x-2 text-sm">
              <svg class="animate-spin h-5 w-5 text-slate-950" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span>Aplicando Restricciones...</span>
            </span>
          </button>

          <div v-if="errorMensaje" class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            ⚠️ {{ errorMensaje }}
          </div>
        </div>

        <!-- Panel Derecho: Resultados -->
        <div class="lg:col-span-7 space-y-6">
          
          <!-- Estado Vacío -->
          <div v-if="!resultado && !cargando" class="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-16 text-center space-y-5 min-h-[520px] flex flex-col items-center justify-center shadow-xl">
            <div class="w-20 h-20 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-3xl shadow-inner">
              📊
            </div>
            <div class="space-y-2">
              <h3 class="text-xl font-bold text-white">Listo para optimizar</h3>
              <p class="text-sm text-slate-400 max-w-md mx-auto">Ingresa tus datos y restricciones a la izquierda para generar el plan semanal validado por el motor SQL.</p>
            </div>
          </div>

          <!-- Visualización del Plan Generado -->
          <div v-if="resultado" class="space-y-6 animate-fade-in">
            
            <!-- Tarjetas de Resumen -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Costo vs Presupuesto [R4]</span>
                <p class="text-xl font-black text-emerald-400 mt-1">${{ resultado.resumen.costoEstimado.toLocaleString() }} <span class="text-xs text-slate-400">COP</span></p>
                <span :class="resultado.resumen.cumplePresupuesto ? 'text-emerald-400' : 'text-rose-400'" class="text-[10px] font-bold mt-1 block">
                  {{ resultado.resumen.cumplePresupuesto ? '✔ Dentro del presupuesto' : '⚠ Supera el presupuesto' }}
                </span>
              </div>

              <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Proteína Diaria [R2]</span>
                <p class="text-2xl font-black text-teal-300 mt-1">{{ resultado.resumen.proteinaDiaria }} <span class="text-xs text-slate-400">g (Mínimo)</span></p>
              </div>

              <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID Registro Tesis</span>
                <p class="text-lg font-mono font-bold text-amber-400 mt-1.5">#{{ planId }}</p>
              </div>
            </div>

            <!-- Grilla de los 7 Días -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[550px] overflow-y-auto pr-2">
              <div 
                v-for="dia in resultado.menu" 
                :key="dia.dia" 
                class="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition duration-200 shadow-md space-y-3"
              >
                <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span class="font-extrabold text-white text-base flex items-center space-x-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span>{{ dia.dia }}</span>
                  </span>
                  <span class="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                    ${{ dia.costo.toLocaleString() }}
                  </span>
                </div>

                <div class="space-y-2 text-xs">
                  <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                    <span class="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">🍳 Desayuno</span>
                    <span class="text-slate-200 font-medium block">{{ dia.desayuno }}</span>
                  </div>
                  <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                    <span class="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">🍲 Almuerzo</span>
                    <span class="text-slate-200 font-medium block">{{ dia.almuerzo }}</span>
                  </div>
                  <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                    <span class="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">🥗 Cena</span>
                    <span class="text-slate-200 font-medium block">{{ dia.cena }}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import axios from 'axios';

// Las 7 restricciones exactas adaptadas al formulario
const listaRestricciones = [
  { etiqueta: 'Sin Lactosa', valor: 'lactosa' },
  { etiqueta: 'Sin Gluten', valor: 'gluten' },
  { etiqueta: 'Sin Mariscos', valor: 'mariscos' },
  { etiqueta: 'Sin Pescado', valor: 'pescado' },
  { etiqueta: 'Sin Frutos Secos', valor: 'frutos_secos' },
  { etiqueta: 'Sin Soya', valor: 'soya' },
  { etiqueta: 'Bajo en Sodio', valor: 'sodio' }
];

const form = reactive({
  peso: 75,
  presupuesto: 120000,
  calorias: 2200,
  alergias: []
});

const cargando = ref(false);
const resultado = ref(null);
const planId = ref(null);
const errorMensaje = ref(null);

const generarPlan = async () => {
  cargando.value = true;
  resultado.value = null;
  errorMensaje.value = null;

  try {
    const res = await axios.post('http://localhost:3000/api/nutrition/generar-plan', form);
    if (res.data.success) {
      resultado.value = res.data.data;
      planId.value = res.data.planId;
    }
  } catch (err) {
    console.error("Error al conectar:", err);
    errorMensaje.value = err.response?.data?.message || "No se pudo conectar con el servidor backend en http://localhost:3000";
  } finally {
    cargando.value = false;
  }
};
</script>