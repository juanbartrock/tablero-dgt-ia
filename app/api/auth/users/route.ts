import { NextRequest, NextResponse } from 'next/server';
// Importar funciones específicas
import { 
    getUsersWithoutPasswords, 
    createUser, 
    getUserByUsername, 
    updateUser, 
    getUserById, 
    deleteUser 
} from '@/app/lib/auth/db';

// GET - Obtener todos los usuarios
export async function GET(request: NextRequest) {
  try {
    // Obtener todos los usuarios sin contraseñas
    const users = await getUsersWithoutPasswords();
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, name } = body;
    
    if (!username || !password || !name) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }
    
    // Crear el nuevo usuario
    await createUser(username, password, name);
    
    // Devolver la lista actualizada de usuarios
    const users = await getUsersWithoutPasswords();
    
    return NextResponse.json({ 
      users,
      message: 'Usuario creado correctamente' 
    });
  } catch (error: any) { // Tipar error
    console.error('Error al crear usuario:', error);
    // Manejar error de usuario duplicado
    if (error.message === 'Username already exists.') {
       return NextResponse.json({ message: 'El nombre de usuario ya está en uso' }, { status: 409 }); // Conflict
    }
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un usuario existente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, username, password, name } = body;
    
    if (!id || !username || !name) {
      return NextResponse.json(
        { message: 'ID, nombre de usuario y nombre son requeridos' },
        { status: 400 }
      );
    }
    
    // Verificar que el usuario exista
    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // Si se está cambiando el nombre de usuario, verificar que no exista otro con ese nombre
    if (username !== user.username) {
      // Nota: updateUser ahora maneja internamente la verificación de duplicados
      // y lanza un error si el nuevo username ya existe. Simplificamos aquí.
      // const existingUser = await getUserByUsername(username);
      // if (existingUser && existingUser.id !== id) {
      //   return NextResponse.json(
      //     { message: 'El nombre de usuario ya está en uso' },
      //     { status: 400 }
      //   );
      // }
    }
    
    // Actualizar el usuario
    await updateUser(id, username, password || null, name);
    
    // Devolver la lista actualizada de usuarios
    const users = await getUsersWithoutPasswords();
    
    return NextResponse.json({ 
      users,
      message: 'Usuario actualizado correctamente' 
    });
  } catch (error: any) { // Tipar error
    console.error('Error al actualizar usuario:', error);
    // Manejar errores específicos de updateUser
    if (error.message === 'Username already exists.') {
       return NextResponse.json({ message: 'El nombre de usuario ya existe' }, { status: 409 }); // Conflict
    } else if (error.message === 'User not found or update failed.') {
       return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un usuario
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { message: 'ID de usuario requerido' },
        { status: 400 }
      );
    }
    
    const userId = parseInt(id, 10);
    
    // Verificar que el usuario exista
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // No permitir eliminar al usuario admin con ID 1
    if (userId === 1) {
      return NextResponse.json(
        { message: 'No se puede eliminar al usuario administrador principal' },
        { status: 400 }
      );
    }
    
    // Eliminar el usuario
    await deleteUser(userId);
    
    return NextResponse.json({ 
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