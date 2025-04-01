import { NextRequest, NextResponse } from 'next/server';
import { setImportantNotification, clearImportantNotification, getNotificationHistory } from '@/app/lib/db/notifications';
import { cookies } from 'next/headers';
import { db } from '@/app/lib/db/index';
import { users } from '@/app/lib/db/schema';
import { eq } from 'drizzle-orm';

// Middleware para verificar que el usuario está autenticado
async function verifyAuthenticatedUser() {
  try {
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth_user');
    
    if (!authCookie?.value) {
      return null;
    }
    
    const userData = JSON.parse(authCookie.value);
    if (!userData || !userData.id) {
      return null;
    }
    
    const user = await db.select()
      .from(users)
      .where(eq(users.id, userData.id))
      .limit(1);
    
    if (!user || user.length === 0) {
      return null;
    }
    
    return user[0];
  } catch (error) {
    console.error('Error al verificar usuario:', error);
    return null;
  }
}

// Middleware para verificar que el usuario es administrador
async function verifyAdminAccess() {
  try {
    const user = await verifyAuthenticatedUser();
    if (!user) {
      return null;
    }
    
    // En este ejemplo, consideramos administradores a los usuarios con username 'admin'
    // o que tengan el ID 1 (primer usuario)
    if (user.username === 'admin' || user.id === 1) {
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('Error al verificar acceso de administrador:', error);
    return null;
  }
}

// GET: Obtener historial de notificaciones
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const notifications = await getNotificationHistory();
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error al obtener historial de notificaciones:', error);
    return NextResponse.json({ error: 'Error al obtener notificaciones' }, { status: 500 });
  }
}

// POST: Crear nueva notificación
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const body = await request.json();
    const { message } = body;
    
    if (!message) {
      return NextResponse.json({ error: 'El mensaje de notificación es requerido' }, { status: 400 });
    }
    
    const notification = await setImportantNotification(
      message,
      user.id,
      user.name
    );
    
    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error('Error al crear notificación:', error);
    return NextResponse.json({ error: 'Error al crear notificación' }, { status: 500 });
  }
}

// DELETE: Desactivar una notificación (solo admin)
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación mediante cookies
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth_user');
    
    if (!authCookie?.value) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Obtener datos del usuario
    const userData = JSON.parse(authCookie.value);
    if (!userData || !userData.id) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
    }
    
    // Verificar que el usuario es administrador (id = 1)
    if (userData.id !== 1) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // Obtener el ID de la notificación de la URL
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    
    if (!notificationId) {
      return NextResponse.json({ error: 'ID de notificación requerido' }, { status: 400 });
    }

    // Desactivar la notificación
    await clearImportantNotification(parseInt(notificationId));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al desactivar notificación:', error);
    return NextResponse.json({ error: 'Error al desactivar notificación' }, { status: 500 });
  }
} 