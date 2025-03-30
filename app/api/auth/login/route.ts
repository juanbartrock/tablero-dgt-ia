import { NextRequest, NextResponse } from 'next/server';
import { authDb } from '@/app/lib/auth/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const user = await authDb.validateUser(username, password);

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 