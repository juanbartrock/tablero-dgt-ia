import { db } from '.';
import { notifications, notificationViews } from './schema';
import { sql } from '@vercel/postgres';
import { eq, and } from 'drizzle-orm';

// Tipos
export type Notification = {
  id: number;
  message: string;
  timestamp: Date;
  createdById: number;
  createdByName: string;
  status: string;
};

export type NotificationView = {
  id: number;
  notificationId: number;
  userId: number;
  viewedAt: Date;
};

// Obtener notificación activa
export async function getCurrentNotification(): Promise<Notification | null> {
  try {
    const result = await db.select()
      .from(notifications)
      .where(eq(notifications.status, 'active'))
      .orderBy(notifications.timestamp);
    
    return result.length > 0 ? result[result.length - 1] : null;
  } catch (error) {
    console.error('Error al obtener notificación activa:', error);
    return null;
  }
}

// Establecer una nueva notificación
export async function setImportantNotification(
  message: string,
  createdById: number,
  createdByName: string
): Promise<Notification> {
  try {
    // Desactivar notificaciones actuales
    await db.update(notifications)
      .set({ status: 'inactive' })
      .where(eq(notifications.status, 'active'));
    
    // Crear nueva notificación
    const result = await db.insert(notifications).values({
      message,
      createdById,
      createdByName,
      status: 'active'
    }).returning();
    
    return result[0];
  } catch (error) {
    console.error('Error al crear notificación:', error);
    throw new Error('No se pudo crear la notificación');
  }
}

// Borrar notificación (desactivar)
export async function clearImportantNotification(notificationId: number): Promise<void> {
  try {
    await db.update(notifications)
      .set({ status: 'inactive' })
      .where(eq(notifications.id, notificationId));
  } catch (error) {
    console.error(`Error al desactivar notificación ${notificationId}:`, error);
    throw new Error('No se pudo desactivar la notificación');
  }
}

// Marcar notificación como vista por un usuario
export async function markNotificationAsViewed(
  notificationId: number,
  userId: number
): Promise<void> {
  try {
    // Verificar si ya ha sido vista
    const existing = await db.select()
      .from(notificationViews)
      .where(
        and(
          eq(notificationViews.notificationId, notificationId),
          eq(notificationViews.userId, userId)
        )
      );
    
    // Si no ha sido vista, registrar vista
    if (existing.length === 0) {
      await db.insert(notificationViews).values({
        notificationId,
        userId
      });
    }
  } catch (error) {
    console.error(`Error al marcar notificación ${notificationId} como vista:`, error);
  }
}

// Verificar si una notificación ha sido vista por un usuario
export async function hasUserViewedNotification(
  notificationId: number,
  userId: number
): Promise<boolean> {
  try {
    const views = await db.select()
      .from(notificationViews)
      .where(
        and(
          eq(notificationViews.notificationId, notificationId),
          eq(notificationViews.userId, userId)
        )
      );
    
    return views.length > 0;
  } catch (error) {
    console.error(`Error al verificar si el usuario ${userId} vio la notificación ${notificationId}:`, error);
    return false;
  }
}

// Obtener historial de notificaciones
export async function getNotificationHistory(): Promise<Notification[]> {
  try {
    return await db.select()
      .from(notifications)
      .orderBy(notifications.timestamp);
  } catch (error) {
    console.error('Error al obtener historial de notificaciones:', error);
    return [];
  }
}

// Obtener estadísticas de vistas de una notificación
export async function getNotificationStats(notificationId: number): Promise<{ 
  totalViews: number;
  viewers: { userId: number; userName: string; viewedAt: Date }[] 
}> {
  try {
    const query = sql`
      SELECT nv.id, nv.user_id, u.name as user_name, nv.viewed_at
      FROM notification_views nv
      JOIN users u ON nv.user_id = u.id
      WHERE nv.notification_id = ${notificationId}
      ORDER BY nv.viewed_at DESC
    `;
    
    const result = await query;
    
    const viewers = result.rows.map((row: any) => ({
      userId: row.user_id,
      userName: row.user_name,
      viewedAt: new Date(row.viewed_at)
    }));
    
    return {
      totalViews: viewers.length,
      viewers
    };
  } catch (error) {
    console.error(`Error al obtener estadísticas de notificación ${notificationId}:`, error);
    return {
      totalViews: 0,
      viewers: []
    };
  }
} 