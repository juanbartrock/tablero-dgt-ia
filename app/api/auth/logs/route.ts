import { NextRequest, NextResponse } from 'next/server';
import { authDb } from '@/app/lib/auth/db';

// Endpoint para registrar una visita manualmente (útil para pruebas)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, username, userName } = body;
    
    if (!userId || !username || !userName) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }
    
    await authDb.recordVisit(userId, username, userName);
    
    return NextResponse.json({ success: true, message: 'Visita registrada correctamente' });
  } catch (error) {
    console.error('Error al registrar visita:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 