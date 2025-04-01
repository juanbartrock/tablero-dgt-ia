import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  try {
    console.log('Iniciando migraciones...');
    
    // Leer y ejecutar el script de migración
    const migrationPath = path.join(process.cwd(), 'app/lib/db/migrations/001_create_notifications.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Ejecutar cada comando SQL por separado
    const commands = migrationSQL.split(';').filter(cmd => cmd.trim());
    for (const command of commands) {
      if (command.trim()) {
        await sql`${command}`;
      }
    }
    
    console.log('Migraciones completadas exitosamente');
  } catch (error) {
    console.error('Error al ejecutar migraciones:', error);
    throw error;
  }
}

// Ejecutar migraciones si este archivo se ejecuta directamente
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { runMigrations }; 