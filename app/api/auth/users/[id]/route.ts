import { NextRequest, NextResponse } from 'next/server';
import { getUserById, deleteUser, getUsersWithoutPasswords, updateUser } from '@/app/lib/auth/db';

// GET - Obtener un usuario específico por ID (sin contraseña)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'ID de usuario inválido' }, { status: 400 });
    }

    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT - Actualizar un usuario específico por ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'ID de usuario inválido' }, { status: 400 });
    }

    const body = await request.json();
    const { username, name, password } = body; // password puede ser null o undefined si no se cambia

    if (!username || !name) {
      return NextResponse.json({ message: 'Nombre de usuario y nombre son requeridos' }, { status: 400 });
    }

    // Llamar a la función updateUser
    // Pasamos el password (que puede ser null/undefined) directamente.
    // updateUser se encarga de hashear si viene un valor.
    const updatedUser = await updateUser(id, username, password || null, name);

    return NextResponse.json(updatedUser);

  } catch (error: any) { // Tipar error
    console.error('Error al actualizar usuario:', error);
    if (error.message === 'Username already exists.') {
       return NextResponse.json({ message: 'El nombre de usuario ya existe' }, { status: 409 }); // Conflict
    } else if (error.message === 'User not found or update failed.') {
       return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

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
    
    // Verificar que el usuario exista (ya no necesitamos el objeto user completo aquí)
    // const user = await getUserById(id); // Ya no es necesario si solo vamos a borrar
    // Podríamos verificar si existe antes, pero deleteUser ya maneja el caso "no encontrado"
    // if (!user) {
    //   return NextResponse.json(
    //     { message: 'Usuario no encontrado' },
    //     { status: 404 }
    //   );
    // }
    
    // No permitir eliminar al usuario admin con ID 1
    if (id === 1) {
      return NextResponse.json(
        { message: 'No se puede eliminar al usuario administrador principal' },
        { status: 400 }
      );
    }
    
    // Eliminar el usuario
    await deleteUser(id);
    
    // Devolver la lista actualizada de usuarios
    const users = await getUsersWithoutPasswords();
    
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