import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import * as schema from './schema';
import bcrypt from 'bcryptjs';

// Crear cliente Drizzle usando la conexión de Vercel
const db = drizzle(sql, { schema });

// Exportar la instancia de db
export { db };

// Función para inicializar la base de datos
export async function initializeDatabase() {
  try {
    // Verificar si la tabla de usuarios existe
    const { rowCount } = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `;

    const tablesExist = rowCount > 0;

    if (!tablesExist) {
      console.log('Creando esquema inicial de la base de datos...');

      // Crear tablas
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password TEXT NOT NULL,
          name VARCHAR(100) NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          description TEXT NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
          responsible VARCHAR(100),
          linked_areas JSONB,
          important_date VARCHAR(50),
          priority VARCHAR(20) NOT NULL DEFAULT 'Media',
          highlighted BOOLEAN DEFAULT FALSE,
          comment TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS visits (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          username VARCHAR(50) NOT NULL,
          user_name VARCHAR(100) NOT NULL,
          timestamp TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          message TEXT NOT NULL,
          timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
          created_by_id INTEGER NOT NULL,
          created_by_name VARCHAR(100) NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'active'
        );

        CREATE TABLE IF NOT EXISTS notification_views (
          id SERIAL PRIMARY KEY,
          notification_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          viewed_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `;

      // Verificar si ya existe un usuario admin
      const { rowCount: adminCount } = await sql`
        SELECT * FROM users WHERE username = 'admin';
      `;

      // Crear usuario admin inicial si no existe
      if (adminCount === 0) {
        console.log('Creando usuario admin inicial...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await sql`
          INSERT INTO users (username, password, name)
          VALUES ('admin', ${hashedPassword}, 'Juan Pablo Pautasso');
        `;
        
        console.log('Usuario admin creado con éxito');
      }

      console.log('Base de datos inicializada correctamente');
    } else {
      console.log('Las tablas ya existen, no es necesario inicializar');
    }
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
} 