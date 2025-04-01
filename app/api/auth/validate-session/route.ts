import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth_user');
    
    if (!authCookie?.value) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const user = JSON.parse(authCookie.value);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error al validar sesión:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 