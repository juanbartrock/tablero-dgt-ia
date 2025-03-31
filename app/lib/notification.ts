'use client';

// Interfaces
export interface Notification {
  id: number;
  message: string;
  timestamp: Date;
  createdById: number;
  createdByName: string;
  status: string;
  hasBeenViewed?: boolean;
}

// Función para obtener el mensaje de notificación importante
export async function getImportantNotification(): Promise<Notification | null> {
  try {
    const response = await fetch('/api/notifications', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error('Error al obtener notificación:', response.statusText);
      return null;
    }
    
    const data = await response.json();
    return data.notification;
  } catch (error) {
    console.error('Error al obtener la notificación:', error);
    return null;
  }
}

// Función para establecer una nueva notificación importante (solo para administradores)
export async function setImportantNotification(message: string): Promise<Notification | null> {
  try {
    const response = await fetch('/api/notifications/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    
    if (!response.ok) {
      console.error('Error al crear notificación:', response.statusText);
      throw new Error('No se pudo crear la notificación');
    }
    
    const data = await response.json();
    return data.notification;
  } catch (error) {
    console.error('Error al guardar la notificación:', error);
    throw new Error('No se pudo guardar la notificación');
  }
}

// Función para borrar la notificación importante (solo para administradores)
export async function clearImportantNotification(notificationId: number): Promise<void> {
  try {
    const response = await fetch(`/api/notifications/admin?id=${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Error al borrar notificación:', response.statusText);
      throw new Error('No se pudo borrar la notificación');
    }
  } catch (error) {
    console.error('Error al borrar la notificación:', error);
    throw new Error('No se pudo borrar la notificación');
  }
}

// Función para marcar una notificación como vista
export async function markNotificationAsViewed(notificationId: number): Promise<void> {
  try {
    const response = await fetch('/api/notifications/viewed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notificationId }),
    });
    
    if (!response.ok) {
      console.error('Error al marcar notificación como vista:', response.statusText);
      throw new Error('No se pudo marcar la notificación como vista');
    }
  } catch (error) {
    console.error('Error al marcar la notificación como vista:', error);
    throw new Error('No se pudo marcar la notificación como vista');
  }
}

// Función para obtener el historial de notificaciones (solo para administradores)
export async function getNotificationHistory(): Promise<Notification[]> {
  try {
    const response = await fetch('/api/notifications/admin', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error('Error al obtener historial de notificaciones:', response.statusText);
      return [];
    }
    
    const data = await response.json();
    return data.notifications || [];
  } catch (error) {
    console.error('Error al obtener historial de notificaciones:', error);
    return [];
  }
} 