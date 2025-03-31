import { NextRequest, NextResponse } from 'next/server';
import { setImportantNotification, clearImportantNotification, getNotificationHistory } from '@/app/lib/db/notifications';
import { cookies } from 'next/headers';
import { db } from '@/app/lib/db/index';
import { users } from '@/app/lib/db/schema';
import { eq } from 'drizzle-orm';

// Middleware para verificar que el usuario es administrador
async function verifyAdminAccess() {
  // Verificar autenticación mediante cookies
  const cookieStore = cookies();
  const authCookie = cookieStore.get('auth_user');
  
  if (!authCookie?.value) {
    return null;
  }
  
  // Obtener datos del usuario
  const userData = JSON.parse(authCookie.value);
  if (!userData || !userData.id) {
    return null;
  }
  
  // En este ejemplo, consideramos al usuario con id=1 como administrador
  // En un sistema real, deberías verificar un rol de administrador en la base de datos
  if (userData.id !== 1 && userData.username !== 'admin') {
    return null;
  }
  
  return userData;
}

// GET: Obtener historial de notificaciones
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminAccess();
    if (!admin) {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
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
    const admin = await verifyAdminAccess();
    if (!admin) {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }
    
    const body = await request.json();
    const { message } = body;
    
    if (!message) {
      return NextResponse.json({ error: 'El mensaje de notificación es requerido' }, { status: 400 });
    }
    
    const notification = await setImportantNotification(
      message,
      admin.id,
      admin.name
    );
    
    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error('Error al crear notificación:', error);
    return NextResponse.json({ error: 'Error al crear notificación' }, { status: 500 });
  }
}

// DELETE: Eliminar notificación
export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdminAccess();
    if (!admin) {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    
    if (!notificationId) {
      return NextResponse.json({ error: 'ID de notificación requerido' }, { status: 400 });
    }
    
    await clearImportantNotification(parseInt(notificationId));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    return NextResponse.json({ error: 'Error al eliminar notificación' }, { status: 500 });
  }
} 