import { NextRequest, NextResponse } from 'next/server';
import { authDb } from '@/app/lib/auth/db';

// DELETE - Eliminar un usuario específico por ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'ID de usuario inválido' },
        { status: 400 }
      );
    }
    
    // Verificar que el usuario exista
    const user = await authDb.getUserById(id);
    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // No permitir eliminar al usuario admin con ID 1
    if (id === 1) {
      return NextResponse.json(
        { message: 'No se puede eliminar al usuario administrador principal' },
        { status: 400 }
      );
    }
    
    // Eliminar el usuario
    await authDb.deleteUser(id);
    
    // Devolver la lista actualizada de usuarios
    const users = await authDb.getUsersWithoutPasswords();
    
    return NextResponse.json({ 
      users,
      message: 'Usuario eliminado correctamente' 
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 