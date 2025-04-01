import { NextRequest, NextResponse } from 'next/server';
import { 
  getCurrentNotification, 
  getNotificationHistory, 
  hasUserViewedNotification,
  markNotificationAsViewed 
} from '@/app/lib/db/notifications';
import { cookies } from 'next/headers';
import { db } from '@/app/lib/db/index';
import { users } from '@/app/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET: Obtener notificación actual
export async function GET(request: NextRequest) {
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
    
    // Verificar que el usuario existe en la base de datos
    const userExists = await db.select().from(users).where(eq(users.id, userData.id));
    if (!userExists || userExists.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
    }

    // Obtener la notificación activa
    const notification = await getCurrentNotification(userData.id);
    
    // Si no hay notificación, devolver null
    if (!notification) {
      return NextResponse.json({ notification: null });
    }
    
    return NextResponse.json({
      notification: notification
    });
  } catch (error) {
    console.error('Error al obtener notificación:', error);
    return NextResponse.json({ error: 'Error al obtener notificación' }, { status: 500 });
  }
}

// POST: Marcar notificación como vista
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth_user');
    
    if (!authCookie?.value) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const userData = JSON.parse(authCookie.value);
    if (!userData || !userData.id) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
    }

    const { notificationId } = await request.json();
    if (!notificationId) {
      return NextResponse.json({ error: 'ID de notificación requerido' }, { status: 400 });
    }

    // Verificar que el usuario existe
    const userExists = await db.select().from(users).where(eq(users.id, userData.id));
    if (!userExists || userExists.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
    }

    // Marcar la notificación como vista
    await markNotificationAsViewed(notificationId, userData.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al marcar notificación como vista:', error);
    return NextResponse.json({ error: 'Error al marcar notificación como vista' }, { status: 500 });
  }
} 