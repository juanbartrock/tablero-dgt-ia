'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/auth/auth-context';

interface Notification {
  message: string;
  timestamp: number;
  createdBy?: string;
  createdAt?: string;
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
  
  // Cargar la notificación actual
  useEffect(() => {
    if (!message) {
      loadStoredNotification();
    } else {
      setCurrentNotification({ message, timestamp: Date.now() });
    }
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
  
  // Observador para eliminar el contenedor de notificaciones duplicadas
  useEffect(() => {
    // Desactivar el contenedor que usa notification-handler.js para evitar duplicación
    const container = document.getElementById('notification-container');
    if (container) {
      container.style.display = 'none';
    }
    
    // Al desmontar, restaurar el contenedor
    return () => {
      if (container) {
        container.style.display = '';
      }
    };
  }, []);
  
  // Cargar notificaciones desde localStorage
  const loadStoredNotification = () => {
    try {
      const storedNotification = localStorage.getItem('important_notification');
      if (storedNotification) {
        const data = JSON.parse(storedNotification);
        if (data && data.message) {
          setCurrentNotification(data);
        }
      }
    } catch (error) {
      console.error('Error al cargar la notificación:', error);
    }
  };
  
  // Marcar la notificación como vista
  const handleMarkAsViewed = () => {
    if (!currentNotification || !user) return;
    
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
    
    // Agregar esta notificación a las vistas
    viewedNotifications.push({
      userId: user.id,
      username: user.username,
      userName: user.name,
      notificationId: currentNotification.timestamp,
      notificationMessage: currentNotification.message,
      viewedAt: new Date().toISOString()
    });
    
    // Guardar en localStorage
    localStorage.setItem('viewed_notifications', JSON.stringify(viewedNotifications));
    setHasBeenViewed(true);
    
    // Actualizar la visualización
    if (typeof window !== 'undefined' && window.updateNotification) {
      window.updateNotification();
    }
  };
  
  // Eliminar la notificación actual
  const handleDeleteNotification = () => {
    localStorage.removeItem('important_notification');
    setCurrentNotification(null);
    
    // Actualizar la visualización
    if (typeof window !== 'undefined' && window.updateNotification) {
      window.updateNotification();
    }
  };
  
  // Si no hay notificación, no mostrar nada
  if (!currentNotification && !message) {
    return null;
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
      </div>
    );
  }
  
  return null;
} 