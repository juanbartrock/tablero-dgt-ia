import { NextResponse } from 'next/server';
import { setupDatabase } from '@/app/lib/db/setup';

export const maxDuration = 60; // 60 segundos máximo

export async function GET() {
  try {
    console.log('Ejecutando inicialización programada de la base de datos');
    await setupDatabase();
    
    return NextResponse.json({ 
      success: true,
      message: 'Base de datos inicializada correctamente' 
    });
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Error al inicializar la base de datos',
        error: String(error)
      },
      { status: 500 }
    );
  }
} 