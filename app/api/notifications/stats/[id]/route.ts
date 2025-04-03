import { NextResponse } from 'next/server';
import { getNotificationStats } from '@/app/lib/db/notifications';
import { verifyAdminAccess } from '@/app/lib/auth/auth-utils';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar que el usuario es administrador
    const isAdmin = await verifyAdminAccess();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    const notificationId = parseInt(params.id);
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: 'ID de notificación inválido' },
        { status: 400 }
      );
    }

    // Obtener estadísticas de vistas de la notificación
    const stats = await getNotificationStats(notificationId);
    
    return NextResponse.json({ stats });
  } catch (error) {
    console.error(`Error al obtener estadísticas de notificación ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de la notificación' },
      { status: 500 }
    );
  }
} 