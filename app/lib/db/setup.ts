import { initializeDatabase } from './index';

// Script para inicializar la base de datos
export async function setupDatabase() {
  try {
    console.log('Inicializando base de datos...');
    await initializeDatabase();
    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar base de datos:', error);
  }
}

// Exportar para usar en la inicialización de la aplicación
export default setupDatabase; 