import { cookies } from 'next/headers';

export async function verifyAdminAccess() {
  const cookieStore = cookies();
  const authUser = cookieStore.get('auth_user');

  if (!authUser) {
    return false;
  }

  try {
    const userData = JSON.parse(authUser.value);
    return userData.id === 1; // El usuario con ID 1 es el administrador
  } catch (error) {
    console.error('Error al verificar acceso de administrador:', error);
    return false;
  }
} 