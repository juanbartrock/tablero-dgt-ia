'use client';

// Clave para almacenar la notificación en localStorage
const NOTIFICATION_KEY = 'important_notification';

// Función para obtener el mensaje de notificación importante
export async function getImportantNotification(): Promise<string | null> {
  // Esta función se ejecutará en el servidor durante SSR y en el cliente durante la hidratación
  // Por lo tanto, necesitamos verificar si estamos en el cliente
  if (typeof window === 'undefined') {
    // En el servidor, devolvemos null (o podríamos usar un valor por defecto)
    return null;
  }
  
  try {
    const storedNotification = localStorage.getItem(NOTIFICATION_KEY);
    if (!storedNotification) return null;
    
    const notification = JSON.parse(storedNotification);
    return notification.message || null;
  } catch (error) {
    console.error('Error al obtener la notificación:', error);
    return null;
  }
}

// Función para establecer una nueva notificación importante
export async function setImportantNotification(message: string): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(
      NOTIFICATION_KEY,
      JSON.stringify({ message, timestamp: new Date().toISOString() })
    );
    console.log('Nueva notificación establecida:', message);
  } catch (error) {
    console.error('Error al guardar la notificación:', error);
    throw new Error('No se pudo guardar la notificación');
  }
}

// Función para borrar la notificación importante
export async function clearImportantNotification(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(NOTIFICATION_KEY);
    console.log('Notificación importante borrada');
  } catch (error) {
    console.error('Error al borrar la notificación:', error);
    throw new Error('No se pudo borrar la notificación');
  }
} 