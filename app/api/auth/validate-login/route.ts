import { NextRequest, NextResponse } from 'next/server';
import { authDb } from '@/app/lib/auth/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user } = body;
    
    if (!user || !user.id || !user.username || !user.name) {
      return NextResponse.json(
        { message: 'Datos de usuario incompletos' },
        { status: 400 }
      );
    }
    
    // Registrar una visita para el usuario actual
    await authDb.recordVisit(user.id, user.username, user.name);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Visita registrada correctamente' 
    });
  } catch (error) {
    console.error('Error al registrar visita:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 