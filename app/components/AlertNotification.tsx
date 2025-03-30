'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/auth/auth-context';

interface Notification {
  message: string;
  timestamp: number;
  createdBy?: string;
  createdAt?: string;
  viewCount?: number;
}

interface AlertNotificationProps {
  message?: string;
}

// Declaración para corregir el acceso a window.updateNotification
declare global {
  interface Window {
    updateNotification?: () => void;
  }
}

export default function AlertNotification({ message }: AlertNotificationProps) {
  const { user } = useAuth();
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [hasBeenViewed, setHasBeenViewed] = useState(false);
  
  // Cargar la notificación actual - Función principal
  useEffect(() => {
    // Prioridad a las notificaciones pasadas como props
    if (message) {
      console.log('AlertNotification: Mostrando notificación desde props:', message);
      setCurrentNotification({ message, timestamp: Date.now() });
    } else {
      // Cargar desde localStorage
      loadStoredNotification();
    }
    
    // Configurar un intervalo para actualizar periódicamente - cada 3 segundos
    const interval = setInterval(loadStoredNotification, 3000);
    
    return () => clearInterval(interval);
  }, [message]);
  
  // Verificar si la notificación ha sido vista
  useEffect(() => {
    if (currentNotification && user) {
      const viewedData = localStorage.getItem('viewed_notifications');
      if (viewedData) {
        try {
          const viewedNotifications = JSON.parse(viewedData);
          // Verificar si esta notificación ya fue vista por este usuario
          const isViewed = viewedNotifications.some((item: {notificationId: number, userId: number}) => 
            item.notificationId === currentNotification.timestamp && 
            item.userId === user.id
          );
          setHasBeenViewed(isViewed);
        } catch (error) {
          console.error('Error al procesar notificaciones vistas:', error);
        }
      }
    }
  }, [currentNotification, user]);
  
  // Cargar notificaciones desde localStorage - Implementación detallada
  const loadStoredNotification = () => {
    try {
      const storedNotification = localStorage.getItem('important_notification');
      console.log('AlertNotification: Intentando cargar notificación desde localStorage:', storedNotification);
      
      if (storedNotification) {
        const data = JSON.parse(storedNotification);
        console.log('AlertNotification: Notificación parseada:', data);
        
        if (data && data.message) {
          // Comparar con la notificación actual para evitar renders innecesarios
          if (!currentNotification || currentNotification.timestamp !== data.timestamp) {
            console.log('AlertNotification: Actualizando notificación actual');
            setCurrentNotification(data);
          }
        } else {
          console.log('AlertNotification: Datos de notificación inválidos o sin mensaje');
        }
      } else {
        // Limpiar notificación actual si no hay nada en localStorage
        if (currentNotification && !message) {
          console.log('AlertNotification: Limpiando notificación actual porque no hay datos en localStorage');
          setCurrentNotification(null);
        }
      }
    } catch (error) {
      console.error('Error al cargar la notificación:', error);
    }
  };
  
  // Marcar la notificación como vista
  const handleMarkAsViewed = () => {
    if (!currentNotification || !user) return;
    
    try {
      // Obtener notificaciones vistas existentes
      let viewedNotifications = [];
      const viewedData = localStorage.getItem('viewed_notifications');
      if (viewedData) {
        try {
          viewedNotifications = JSON.parse(viewedData);
        } catch (error) {
          console.error('Error al cargar notificaciones vistas:', error);
        }
      }
      
      // Verificar si el usuario ya vio esta notificación
      const alreadyViewed = viewedNotifications.some(
        (record: any) => 
          record.notificationId === currentNotification.timestamp && 
          record.userId === user.id
      );
      
      // Solo registrar la visualización si es la primera vez
      if (!alreadyViewed) {
        console.log('AlertNotification: Marcando notificación como vista por primera vez:', currentNotification.message);
        
        // Crear registro detallado de visualización
        const viewRecord = {
          userId: user.id,
          username: user.username,
          userName: user.name,
          notificationId: currentNotification.timestamp,
          notificationMessage: currentNotification.message,
          createdBy: currentNotification.createdBy,
          createdAt: currentNotification.createdAt,
          viewedAt: new Date().toISOString(),
          deviceInfo: navigator.userAgent,
          viewCount: (currentNotification.viewCount || 0) + 1
        };
        
        // Agregar esta notificación a las vistas
        viewedNotifications.push(viewRecord);
        
        // Guardar en localStorage
        localStorage.setItem('viewed_notifications', JSON.stringify(viewedNotifications));
      } else {
        console.log('AlertNotification: Notificación ya vista anteriormente por este usuario');
      }
      
      setHasBeenViewed(true);
      
      // Actualizar contador de vistas en la notificación actual si existe
      if (currentNotification) {
        const updatedNotification = {
          ...currentNotification,
          viewCount: (currentNotification.viewCount || 0) + 1
        };
        localStorage.setItem('important_notification', JSON.stringify(updatedNotification));
        setCurrentNotification(updatedNotification);
      }
    } catch (error) {
      console.error('Error al registrar visualización de notificación:', error);
    }
  };
  
  // Eliminar la notificación actual
  const handleDeleteNotification = () => {
    if (!currentNotification || !user) return;
    
    console.log('AlertNotification: Eliminando notificación:', currentNotification.message);
    
    // Registrar la eliminación de la notificación
    try {
      const deletedNotifications = localStorage.getItem('deleted_notifications') ? 
        JSON.parse(localStorage.getItem('deleted_notifications') || '[]') : [];
      
      // Agregar el registro de eliminación
      deletedNotifications.push({
        notificationId: currentNotification.timestamp,
        notificationMessage: currentNotification.message,
        deletedBy: user.username,
        deletedByName: user.name,
        deletedById: user.id,
        deletedAt: new Date().toISOString(),
        originalCreatedBy: currentNotification.createdBy,
        originalCreatedAt: currentNotification.createdAt
      });
      
      // Guardar registro de eliminaciones
      localStorage.setItem('deleted_notifications', JSON.stringify(deletedNotifications));
      
      // Eliminar la notificación
      localStorage.removeItem('important_notification');
      setCurrentNotification(null);
    } catch (error) {
      console.error('Error al registrar eliminación de notificación:', error);
    }
  };
  
  // Forzar actualización inmediata de la notificación (usada en desarrollo)
  const forceUpdate = () => {
    console.log('AlertNotification: Forzando actualización');
    loadStoredNotification();
  };
  
  // Si no hay notificación, no mostrar nada
  if (!currentNotification && !message) {
    return (
      <div className="hidden">
        {/* Botón solo visible en modo desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <button 
            onClick={forceUpdate} 
            className="text-xs text-gray-500 border border-gray-300 rounded px-2 py-1"
          >
            Actualizar notificaciones
          </button>
        )}
      </div>
    );
  }
  
  // Si hay una notificación para mostrar
  if (currentNotification) {
  return (
    <div className="bg-red-600 text-white p-4 mb-6 rounded-md shadow-md border-2 border-red-800">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 mr-2 flex-shrink-0" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
            <div className="font-bold text-lg">{currentNotification.message}</div>
          </div>
          <div className="flex items-center space-x-2">
            {hasBeenViewed ? (
              <span className="text-xs bg-white text-red-600 px-2 py-1 rounded">Vista</span>
            ) : (
              <button 
                onClick={handleMarkAsViewed} 
                className="bg-white text-red-600 px-3 py-1 rounded text-sm hover:bg-red-100"
              >
                Marcar como vista
              </button>
            )}
            
            {user && user.username === 'admin' && (
              <button
                onClick={handleDeleteNotification}
                className="bg-red-800 text-white px-3 py-1 rounded text-sm hover:bg-red-900"
              >
                Eliminar
              </button>
            )}
          </div>
        </div>
        
        {/* Información de creación - solo visible en desarrollo o para admin */}
        {(process.env.NODE_ENV === 'development' || (user && user.username === 'admin')) && (
          <div className="mt-2 text-xs border-t border-red-700 pt-2 text-red-200">
            <p>
              Creada por: {currentNotification.createdBy || 'Desconocido'} | 
              Fecha: {currentNotification.createdAt ? new Date(currentNotification.createdAt).toLocaleString() : 'Desconocida'} | 
              Vistas: {currentNotification.viewCount || 0}
            </p>
          </div>
        )}
    </div>
  );
  }
  
  return null;
} 