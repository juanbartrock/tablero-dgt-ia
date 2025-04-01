import { NextRequest, NextResponse } from 'next/server';
import { markNotificationAsViewed } from '@/app/lib/db/notifications';
import { cookies } from 'next/headers';
import { db } from '@/app/lib/db/index';
import { users } from '@/app/lib/db/schema';
import { eq } from 'drizzle-orm';

// POST: Marcar una notificación como vista
export async function POST(request: NextRequest) {
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
    
    // Verificar que el usuario existe
    const userExists = await db.select()
      .from(users)
      .where(eq(users.id, userData.id));
    
    if (!userExists || userExists.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
    }

    // Obtener el ID de la notificación del body
    const { notificationId } = await request.json();
    
    if (!notificationId) {
      return NextResponse.json({ error: 'ID de notificación requerido' }, { status: 400 });
    }

    // Marcar la notificación como vista
    await markNotificationAsViewed(notificationId, userData.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al marcar notificación como vista:', error);
    return NextResponse.json({ error: 'Error al marcar notificación como vista' }, { status: 500 });
  }
} 