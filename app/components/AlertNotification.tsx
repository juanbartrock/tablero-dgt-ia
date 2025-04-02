'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/auth/auth-context';

interface Notification {
  id: number;
  message: string;
  timestamp: Date;
  created_by_id: number;
  created_by_name: string;
  status: string;
  hasBeenViewed?: boolean;
}

interface AlertNotificationProps {
  message?: string;
}

export default function AlertNotification({ message }: AlertNotificationProps) {
  const { user } = useAuth();
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Cargar la notificación actual
  const loadNotification = async () => {
    try {
      const response = await fetch('/api/notifications', {
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          setCurrentNotification(null);
          return;
        }
        throw new Error('Error al cargar la notificación');
      }

      const data = await response.json();
      setCurrentNotification(data.notification);
    } catch (error) {
      console.error('Error al cargar la notificación:', error);
      setCurrentNotification(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (message) {
      setCurrentNotification({ 
        id: 0, 
        message, 
        timestamp: new Date(), 
        created_by_id: 0, 
        created_by_name: 'Sistema', 
        status: 'active'
      });
      setLoading(false);
    } else {
      loadNotification();
      // Actualizar cada 30 segundos
      const interval = setInterval(loadNotification, 30000);
      return () => clearInterval(interval);
    }
  }, [message]);
  
  // Marcar como vista
  const handleMarkAsViewed = async () => {
    if (!currentNotification || !user) return;
    
    try {
      console.log('Intentando marcar como vista la notificación:', {
        id: currentNotification.id,
        message: currentNotification.message
      });
      
      const response = await fetch('/api/notifications/viewed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          notificationId: currentNotification.id 
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Error al marcar como vista');
      }

      // Recargar la notificación para asegurar que tenemos el estado más reciente
      await loadNotification();
    } catch (error) {
      console.error('Error al marcar notificación como vista:', error);
      alert('No se pudo marcar la notificación como vista. Por favor, intenta de nuevo.');
    }
  };
  
  // Eliminar (marcar como inactiva)
  const handleDeleteNotification = async () => {
    if (!currentNotification || !user || user.id !== 1) return;
    
    try {
      const response = await fetch(`/api/notifications/admin?id=${currentNotification.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al desactivar notificación');
      }

      setCurrentNotification(null);
    } catch (error) {
      console.error('Error al desactivar notificación:', error);
    }
  };
  
  if (loading) {
    return null;
  }
  
  if (!currentNotification && !message) {
    return null;
  }
  
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
          <div className="font-bold text-lg">{currentNotification?.message || message}</div>
        </div>
        <div className="flex items-center space-x-2">
          {currentNotification?.hasBeenViewed ? (
            <span className="text-xs bg-white text-red-600 px-2 py-1 rounded">Vista</span>
          ) : (
            <button 
              onClick={handleMarkAsViewed} 
              className="bg-white text-red-600 px-3 py-1 rounded text-sm hover:bg-red-100"
            >
              Marcar como vista
            </button>
          )}
          
          {user && user.id === 1 && currentNotification && (
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