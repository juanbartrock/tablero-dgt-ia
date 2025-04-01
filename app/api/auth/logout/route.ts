import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    
    // Eliminar la cookie de autenticación
    response.cookies.delete('auth_user');
    
    return response;
  } catch (error) {
    console.error('Error en logout:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 