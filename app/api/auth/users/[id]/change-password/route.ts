import { NextRequest, NextResponse } from 'next/server';
import { authDb } from '@/app/lib/auth/db';
import bcrypt from 'bcryptjs';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id, 10);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { message: 'ID de usuario inválido' },
        { status: 400 }
      );
    }
    
    // Obtener el usuario
    const user = await authDb.getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // Obtener datos de la solicitud
    const body = await request.json();
    const { currentPassword, newPassword } = body;
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'La contraseña actual y la nueva son obligatorias' },
        { status: 400 }
      );
    }
    
    // Verificar la contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'La contraseña actual es incorrecta' },
        { status: 400 }
      );
    }
    
    // Actualizar la contraseña
    await authDb.updateUser(userId, user.username, newPassword, user.name);
    
    return NextResponse.json({
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 