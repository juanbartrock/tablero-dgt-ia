import { Pool } from 'pg';

let pool: Pool;

if (!process.env.POSTGRES_URL) {
  console.warn('POSTGRES_URL environment variable is not set. Database functionality will be limited.');
  // Podrías lanzar un error aquí si la conexión es estrictamente necesaria al inicio
  // throw new Error('POSTGRES_URL environment variable is not set.');
}

// Solo intenta crear el pool si la URL está definida
if (process.env.POSTGRES_URL) {
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    // Opciones adicionales recomendadas para producción/Vercel:
    ssl: {
      rejectUnauthorized: false // Necesario para algunas configuraciones de Neon/Vercel
    },
    // max: 20, // Número máximo de clientes en el pool
    // idleTimeoutMillis: 30000, // Tiempo en ms que un cliente puede estar inactivo
    // connectionTimeoutMillis: 2000, // Tiempo en ms para esperar una conexión
  });

  pool.on('connect', () => {
    console.log('Connected to PostgreSQL database pool');
  });

  pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    // Considera reiniciar el proceso o manejar el error de forma más robusta
  });

} else {
  // Asigna un objeto 'dummy' o null para evitar errores si se intenta usar pool sin URL
  // O maneja esto en cada función que use el pool
  // Por simplicidad ahora, solo advertimos.
  // En un caso real, podrías querer implementar un mock o lanzar errores.
  pool = null as any; // Usamos 'any' aquí para evitar errores de tipo, pero ten cuidado
}

// Función para ejecutar consultas
export async function query(text: string, params?: any[]) {
  if (!pool) {
    throw new Error('Database pool is not initialized. Check POSTGRES_URL environment variable.');
  }
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error executing query', { text, error });
    throw error;
  }
}

// Función para obtener un cliente del pool (para transacciones)
export async function getClient() {
  if (!pool) {
    throw new Error('Database pool is not initialized. Check POSTGRES_URL environment variable.');
  }
  const client = await pool.connect();
  return client;
}

// Exporta el pool directamente si necesitas acceder a él (menos común)
// export { pool }; 