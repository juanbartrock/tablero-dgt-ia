'use client';

import React, { useState, useEffect } from 'react';
import { getImportantNotification, setImportantNotification, clearImportantNotification } from '../lib/notification';
import { useRouter } from 'next/navigation';
import TaskManager from '../components/tasks/TaskManager';
import ProtectedRoute from '../lib/auth/protected-route';
import { useAuth } from '../lib/auth/auth-context';

declare global {
  interface Window {
    updateNotification?: () => void;
  }
}

export default function AdminPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [notification, setNotification] = useState<string>('');
  const [currentNotification, setCurrentNotification] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cargar la notificación actual al iniciar
  useEffect(() => {
    const loadNotification = async () => {
      try {
        // Intentar obtener desde localStorage directamente
        const storedNotification = localStorage.getItem('important_notification');
        if (storedNotification) {
          const data = JSON.parse(storedNotification);
          if (data.message) {
            setCurrentNotification(data.message);
            setNotification(data.message);
            return;
          }
        }
        setCurrentNotification(null);
        setNotification('');
      } catch (error) {
        console.error('Error al cargar la notificación:', error);
      }
    };

    loadNotification();
    
    // Limpiar el mensaje de éxito después de 3 segundos
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Actualizar la notificación en la página principal si es posible
  const updateNotificationDisplay = () => {
    // Intentar llamar a la función global si está disponible
    if (typeof window !== 'undefined' && window.updateNotification) {
      window.updateNotification();
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (notification.trim()) {
        // Guardar en localStorage directamente
        localStorage.setItem(
          'important_notification',
          JSON.stringify({ message: notification, timestamp: new Date().toISOString() })
        );
        setCurrentNotification(notification);
        setSuccessMessage('Notificación importante actualizada correctamente');
        
        // Actualizar la notificación en la página principal si está abierta
        updateNotificationDisplay();
      } else {
        // Eliminar de localStorage
        localStorage.removeItem('important_notification');
        setCurrentNotification(null);
        setSuccessMessage('Notificación importante eliminada');
        
        // Actualizar la notificación en la página principal si está abierta
        updateNotificationDisplay();
      }
    } catch (error) {
      console.error('Error al actualizar la notificación:', error);
      setMessage('Error al actualizar la notificación. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar la eliminación de la notificación
  const handleClear = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Eliminar de localStorage
      localStorage.removeItem('important_notification');
      setCurrentNotification(null);
      setNotification('');
      setSuccessMessage('Notificación importante eliminada');
      
      // Actualizar la notificación en la página principal si está abierta
      updateNotificationDisplay();
    } catch (error) {
      console.error('Error al eliminar la notificación:', error);
      setMessage('Error al actualizar la notificación. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
            <p className="text-gray-600">Gestione todas las tareas del sistema</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
            >
              Volver al Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <TaskManager />
        </div>
      </div>
    </ProtectedRoute>
  );
} 