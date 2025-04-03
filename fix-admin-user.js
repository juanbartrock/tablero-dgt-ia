const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function fixAdminUser() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Conectar a la base de datos
    await client.connect();
    console.log('Conectado a la base de datos');

    // Verificar si existe la tabla de usuarios
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);

    const tableExists = tableCheck.rows[0].exists;
    
    if (!tableExists) {
      console.log('La tabla de usuarios no existe. Creando tabla...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password TEXT NOT NULL,
          name VARCHAR(100) NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      console.log('Tabla de usuarios creada correctamente');
    }

    // Verificar si el usuario admin existe
    const userCheck = await client.query(`
      SELECT * FROM users WHERE username = 'admin';
    `);

    // Generar hash de la contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10);

    if (userCheck.rows.length === 0) {
      console.log('Usuario admin no existe. Creando usuario...');
      // Crear el usuario admin
      await client.query(`
        INSERT INTO users (username, password, name)
        VALUES ('admin', $1, 'Juan Pablo Pautasso');
      `, [hashedPassword]);
      console.log('Usuario admin creado correctamente');
    } else {
      console.log('Usuario admin existe. Actualizando contraseña...');
      // Actualizar la contraseña
      await client.query(`
        UPDATE users SET password = $1 WHERE username = 'admin';
      `, [hashedPassword]);
      console.log('Contraseña del usuario admin actualizada correctamente');
    }

    // Verificar si la contraseña se actualizó correctamente
    const updatedUser = await client.query(`
      SELECT * FROM users WHERE username = 'admin';
    `);

    // Verificar hash (solo para demostración)
    const isValidHash = await bcrypt.compare('admin123', updatedUser.rows[0].password);
    console.log('¿La contraseña está correctamente hasheada?', isValidHash);

    console.log('Proceso completado con éxito');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Cerrar la conexión
    await client.end();
    console.log('Conexión cerrada');
  }
}

fixAdminUser(); 