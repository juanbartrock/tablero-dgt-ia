'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/auth/auth-context';
import { getNotificationHistory, Notification } from '@/app/lib/notification';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos de registros
interface ViewRecord {
  id: number;
  notificationId: number;
  userId: number;
  username: string;
  userName: string;
  viewedAt: Date;
}

interface NotificationWithViews extends Notification {
  views: ViewRecord[];
}

// Componente principal
export default function NotificationHistory() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationWithViews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cargar notificaciones desde API
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user || user.id !== 1) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Obtener notificaciones desde API
        const notificationsData = await getNotificationHistory();
        
        if (notificationsData && notificationsData.length > 0) {
          // Por ahora, asumimos que las vistas vienen incluidas en las estadísticas
          // En una implementación real, podríamos hacer otra llamada a la API para obtener las vistas
          const notificationsWithViews = notificationsData.map(notification => ({
            ...notification,
            views: [] // Placeholder para vistas
          }));
          
          setNotifications(notificationsWithViews);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error('Error al cargar notificaciones:', error);
        setError('No se pudieron cargar las notificaciones. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    loadNotifications();
  }, [user]);
  
  // Formatear fecha
  const formatDate = (date: Date) => {
    return format(new Date(date), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
  };
  
  // Si no hay acceso (no es admin), mostrar mensaje
  if (!user || user.id !== 1) {
    return (
      <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-md">
        <p className="text-yellow-800">Esta sección solo está disponible para administradores.</p>
      </div>
    );
  }
  
  // Si está cargando
  if (loading) {
    return (
      <div className="p-4 border border-gray-200 rounded-md">
        <p className="text-gray-500">Cargando historial de notificaciones...</p>
      </div>
    );
  }
  
  // Si hay error
  if (error) {
    return (
      <div className="bg-red-50 p-4 border border-red-200 rounded-md">
        <p className="text-red-800">{error}</p>
        <button 
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    );
  }
  
  // Si no hay notificaciones
  if (notifications.length === 0) {
    return (
      <div className="p-4 border border-gray-200 rounded-md">
        <p className="text-gray-500">No hay notificaciones registradas.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Historial de notificaciones
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Listado completo de notificaciones enviadas en el sistema.
        </p>
      </div>
      
      <ul className="divide-y divide-gray-200">
        {notifications.map((notification, index) => (
          <li key={notification.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-indigo-600 truncate">
                {notification.message}
              </p>
              <div className="ml-2 flex-shrink-0 flex">
                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${notification.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {notification.status === 'active' ? 'Activa' : 'Inactiva'}
                </p>
              </div>
            </div>
            <div className="mt-2 sm:flex sm:justify-between">
              <div className="sm:flex">
                <p className="flex items-center text-sm text-gray-500">
                  <span>
                    Creada por {notification.createdByName || 'Sistema'}
                  </span>
                </p>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                <span>
                  {formatDate(notification.timestamp)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 