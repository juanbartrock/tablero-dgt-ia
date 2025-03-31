import { NextRequest, NextResponse } from 'next/server';
import { getCurrentNotification, getNotificationHistory, hasUserViewedNotification } from '@/app/lib/db/notifications';
import { cookies } from 'next/headers';
import { db } from '@/app/lib/db';
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
    const notification = await getCurrentNotification();
    
    // Si no hay notificación, devolver null
    if (!notification) {
      return NextResponse.json({ notification: null });
    }
    
    // Verificar si el usuario ya ha visto esta notificación
    const hasViewed = await hasUserViewedNotification(
      notification.id,
      userData.id
    );
    
    return NextResponse.json({
      notification: {
        ...notification,
        hasBeenViewed: hasViewed
      }
    });
  } catch (error) {
    console.error('Error al obtener notificación:', error);
    return NextResponse.json({ error: 'Error al obtener notificación' }, { status: 500 });
  }
} 