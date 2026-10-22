<template>
  <div class="layout">
    <header class="navbar">
      <h1>NutriOptimizer AI</h1>
      <span class="badge">Vue 3 + Express</span>
    </header>

    <main class="content">
      <slot />
    </main>

    <footer class="footer">
      <p>&copy; 2026 Planificador Nutricional</p>
    </footer>
  </div>
</template>

<style scoped>
.layout { display: flex; flex-direction: column; min-height: 100vh; font-family: sans-serif; background-color: #f8fafc; }
.navbar { background-color: #0f172a; color: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
.badge { background-color: #0284c7; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
.content { flex: 1; max-width: 950px; width: 100%; margin: 2rem auto; padding: 0 1rem; }
.footer { background-color: #1e293b; color: #94a3b8; text-align: center; padding: 1rem; font-size: 0.85rem; }
</style>
