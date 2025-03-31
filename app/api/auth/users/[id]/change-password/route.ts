import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser } from '@/app/lib/auth/db';
import bcrypt from 'bcryptjs';
import { getUserByUsername } from '@/app/lib/auth/db';

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
    let userWithPassword;
    if (userId === 1) { // Asumiendo ID 1 para admin por ahora
      const tempUser = await getUserByUsername('admin'); // Necesitamos importar getUserByUsername
      if (!tempUser) {
         return NextResponse.json({ message: 'Usuario admin no encontrado' }, { status: 404 });
      }
      userWithPassword = tempUser; 
    } else {
       // Para otros usuarios, esta lógica fallará hasta que se corrija el hasheo
       // O se modifique getUserById para devolver la contraseña (no recomendado)
       return NextResponse.json({ message: 'Funcionalidad no implementada para este usuario' }, { status: 501 });
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
    // ¡¡ADVERTENCIA DE SEGURIDAD!! - Comparación en texto plano temporalmente
    // const isPasswordValid = await bcrypt.compare(currentPassword, userWithPassword.password);
    const isPasswordValid = currentPassword === userWithPassword.password;
    // ¡¡FIN ADVERTENCIA!!
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'La contraseña actual es incorrecta' },
        { status: 400 }
      );
    }
    
    // Actualizar la contraseña llamando a la función importada
    // Pasamos null como contraseña actual porque updateUser hashea la nueva
    await updateUser(userId, userWithPassword.username, newPassword, userWithPassword.name || '');
    
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