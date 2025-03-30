'use client';

import React, { useState, useEffect } from 'react';
import { getImportantNotification, setImportantNotification, clearImportantNotification } from '../lib/notification';

declare global {
  interface Window {
    updateNotification?: () => void;
  }
}

export default function AdminPage() {
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

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold mb-6">Administración de Notificaciones</h1>

      {message && (
        <div className="p-4 mb-4 rounded-md bg-red-100 text-red-800">
          {message}
        </div>
      )}
      
      {successMessage && (
        <div className="p-4 mb-4 rounded-md bg-green-100 text-green-800">
          {successMessage}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Estado Actual:</h2>
        {currentNotification ? (
          <div className="bg-red-600 text-white p-4 rounded-md">
            <p className="font-medium">{currentNotification}</p>
          </div>
        ) : (
          <p className="text-gray-500">No hay ninguna notificación importante activa.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="notification" className="block text-sm font-medium text-gray-700 mb-1">
            Mensaje de Notificación Importante
          </label>
          <textarea
            id="notification"
            value={notification}
            onChange={(e) => setNotification(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Ingrese el mensaje para la notificación importante..."
          />
          <p className="text-sm text-gray-500 mt-1">
            Deje este campo vacío para eliminar la notificación.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Guardando...' : 'Guardar Notificación'}
          </button>
          
          {currentNotification && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isLoading ? 'Eliminando...' : 'Eliminar Notificación'}
            </button>
          )}
        </div>
      </form>

      <div className="border-t border-gray-200 pt-4">
        <a href="/" className="text-blue-600 hover:underline">
          ← Volver al Panel Principal
        </a>
      </div>
      
      <div className="mt-4 p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-800">
          Nota: Las notificaciones creadas o actualizadas aquí aparecerán automáticamente en la página principal.
        </p>
      </div>
    </div>
  );
} 