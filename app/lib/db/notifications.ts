import { db } from './index';
import { notifications, notificationViews } from './schema';
import { sql } from '@vercel/postgres';
import { eq, and } from 'drizzle-orm';

// Tipos
export type Notification = {
  id: number;
  message: string;
  timestamp: Date;
  created_by_id: number;
  created_by_name: string;
  status: string;
  hasBeenViewed?: boolean;
};

export type NotificationView = {
  id: number;
  notification_id: number;
  user_id: number;
  viewed_at: Date;
};

// Obtener notificación activa
export async function getCurrentNotification(): Promise<Notification | null> {
  try {
    const result = await db.select()
      .from(notifications)
      .where(eq(notifications.status, 'active'))
      .orderBy(notifications.timestamp);
    
    if (result.length === 0) return null;

    const notification = result[result.length - 1];
    
    // Verificar si la notificación ha sido vista
    const viewResult = await db.select()
      .from(notificationViews)
      .where(eq(notificationViews.notification_id, notification.id));
    
    return {
      ...notification,
      hasBeenViewed: viewResult.length > 0
    };
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
      created_by_id: createdById,
      created_by_name: createdByName,
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

// Marcar notificación como vista
export async function markNotificationAsViewed(
  notificationId: number,
  userId: number
): Promise<void> {
  try {
    // Verificar si ya existe un registro de visualización
    const existingView = await db.select()
      .from(notificationViews)
      .where(
        and(
          eq(notificationViews.notification_id, notificationId),
          eq(notificationViews.user_id, userId)
        )
      );

    if (existingView.length === 0) {
      // Crear nuevo registro de visualización
      await db.insert(notificationViews).values({
        notification_id: notificationId,
        user_id: userId,
        viewed_at: new Date()
      });
    }
  } catch (error) {
    console.error('Error al marcar notificación como vista:', error);
    throw error;
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
          eq(notificationViews.notification_id, notificationId),
          eq(notificationViews.user_id, userId)
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