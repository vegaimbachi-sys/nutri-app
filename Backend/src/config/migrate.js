const pool = require('./db');

const runMigration = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS alimentos (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(150) NOT NULL,
          precio NUMERIC(10, 2) NOT NULL,
          calorias NUMERIC(8, 2) NOT NULL,
          proteinas NUMERIC(8, 2) NOT NULL,
          carbohidratos NUMERIC(8, 2) NOT NULL,
          grasas NUMERIC(8, 2) NOT NULL,
          alergias VARCHAR(100)[]
      );
    `;
    await pool.query(query);
    console.log("Migración de base de datos ejecutada con éxito.");
  } catch (error) {
    console.error("Error al ejecutar la migración:", error);
  }
};

module.exports = runMigration;