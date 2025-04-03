import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export const maxDuration = 60;

export async function GET() {
  try {
    console.log('Iniciando reparación de usuario admin...');

    // Verificar si existe la tabla de usuarios
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `;

    const tableExists = tableCheck.rows[0].exists;
    
    if (!tableExists) {
      console.log('La tabla de usuarios no existe. Creando tabla...');
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password TEXT NOT NULL,
          name VARCHAR(100) NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `;
      console.log('Tabla de usuarios creada correctamente');
    }

    // Verificar si el usuario admin existe
    const userCheck = await sql`
      SELECT * FROM users WHERE username = 'admin';
    `;

    // Generar hash de la contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10);

    if (userCheck.rowCount === 0) {
      console.log('Usuario admin no existe. Creando usuario...');
      // Crear el usuario admin
      await sql`
        INSERT INTO users (username, password, name)
        VALUES ('admin', ${hashedPassword}, 'Juan Pablo Pautasso');
      `;
      console.log('Usuario admin creado correctamente');
    } else {
      console.log('Usuario admin existe. Actualizando contraseña...');
      // Actualizar la contraseña
      await sql`
        UPDATE users SET password = ${hashedPassword} WHERE username = 'admin';
      `;
      console.log('Contraseña del usuario admin actualizada correctamente');
    }

    // Verificar si la contraseña se actualizó correctamente
    const updatedUser = await sql`
      SELECT * FROM users WHERE username = 'admin';
    `;

    return NextResponse.json({ 
      success: true,
      message: 'Usuario admin reparado correctamente',
      userExists: updatedUser.rowCount > 0
    });
  } catch (error) {
    console.error('Error al reparar usuario admin:', error);
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Error al reparar usuario admin',
        error: String(error)
      },
      { status: 500 }
    );
  }
} 