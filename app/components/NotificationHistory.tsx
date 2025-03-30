'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/auth/auth-context';

interface ViewRecord {
  userId: number;
  username: string;
  userName: string;
  notificationId: number;
  notificationMessage: string;
  createdBy?: string;
  createdAt?: string;
  viewedAt: string;
  deviceInfo?: string;
  viewCount?: number;
}

interface DeleteRecord {
  notificationId: number;
  notificationMessage: string;
  deletedBy: string;
  deletedByName: string;
  deletedById: number;
  deletedAt: string;
  originalCreatedBy?: string;
  originalCreatedAt?: string;
}

interface CreateRecord {
  message: string;
  timestamp: number;
  createdBy: string;
  createdAt: string;
  createdById?: number;
  createdByName?: string;
  status?: string;
  viewCount?: number;
}

// Tipo para el historial unificado
interface NotificationLifecycle {
  id: number;
  message: string;
  createdBy: string;
  createdAt: string;
  viewRecords: ViewRecord[];
  deletedBy?: string;
  deletedAt?: string;
  isActive: boolean;
}

export default function NotificationHistory() {
  const { user } = useAuth();
  const [viewedNotifications, setViewedNotifications] = useState<ViewRecord[]>([]);
  const [deletedNotifications, setDeletedNotifications] = useState<DeleteRecord[]>([]);
  const [createdNotifications, setCreatedNotifications] = useState<CreateRecord[]>([]);
  const [notificationLifecycles, setNotificationLifecycles] = useState<NotificationLifecycle[]>([]);
  const [activeTab, setActiveTab] = useState<'lifecycle' | 'created' | 'deleted'>('lifecycle');
  
  // Cargar todas las notificaciones desde localStorage
  useEffect(() => {
    try {
      // Cargar notificaciones creadas
      const createdData = localStorage.getItem('created_notifications');
      if (createdData) {
        setCreatedNotifications(JSON.parse(createdData));
      }
      
      // Cargar notificaciones vistas
      const viewedData = localStorage.getItem('viewed_notifications');
      if (viewedData) {
        setViewedNotifications(JSON.parse(viewedData));
      }
      
      // Cargar notificaciones eliminadas
      const deletedData = localStorage.getItem('deleted_notifications');
      if (deletedData) {
        setDeletedNotifications(JSON.parse(deletedData));
      }
      
      // Construir el historial unificado
      buildLifecycleHistory();
    } catch (error) {
      console.error('Error al cargar historial de notificaciones:', error);
    }
  }, []);
  
  // Construir el historial unificado cuando cambien los datos
  useEffect(() => {
    buildLifecycleHistory();
  }, [createdNotifications, viewedNotifications, deletedNotifications]);
  
  // Construir el historial unificado del ciclo de vida de las notificaciones
  const buildLifecycleHistory = () => {
    try {
      const lifecycles: NotificationLifecycle[] = [];
      
      // Primero procesar todas las notificaciones creadas
      createdNotifications.forEach(created => {
        // Buscar las visualizaciones de esta notificación
        const views = viewedNotifications.filter(
          view => view.notificationId === created.timestamp
        );
        
        // Buscar si esta notificación fue eliminada
        const deletion = deletedNotifications.find(
          del => del.notificationId === created.timestamp
        );
        
        // Verificar si la notificación sigue activa
        let isActive = false;
        try {
          const activeNotification = localStorage.getItem('important_notification');
          if (activeNotification) {
            const activeData = JSON.parse(activeNotification);
            isActive = activeData.timestamp === created.timestamp;
          }
        } catch (e) {
          console.error("Error verificando notificación activa:", e);
        }
        
        // Crear el registro del ciclo de vida
        const lifecycle: NotificationLifecycle = {
          id: created.timestamp,
          message: created.message,
          createdBy: created.createdByName || created.createdBy,
          createdAt: created.createdAt,
          viewRecords: views,
          deletedBy: deletion?.deletedByName || deletion?.deletedBy,
          deletedAt: deletion?.deletedAt,
          isActive: isActive
        };
        
        lifecycles.push(lifecycle);
      });
      
      // Ordenar por fecha de creación (más reciente primero)
      lifecycles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setNotificationLifecycles(lifecycles);
    } catch (error) {
      console.error('Error al construir historial del ciclo de vida:', error);
    }
  };
  
  // Formatear fecha
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return dateString || 'Fecha desconocida';
    }
  };
  
  // Si no es admin, no mostrar esta función
  if (!user || user.username !== 'admin') {
    return null;
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Historial de Notificaciones</h2>
      
      {/* Pestañas */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px space-x-8">
          <button 
            onClick={() => setActiveTab('lifecycle')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'lifecycle' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Ciclo de Vida ({notificationLifecycles.length})
          </button>
          <button 
            onClick={() => setActiveTab('created')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'created' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Creadas ({createdNotifications.length})
          </button>
          <button 
            onClick={() => setActiveTab('deleted')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'deleted' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Eliminadas ({deletedNotifications.length})
          </button>
        </nav>
      </div>
      
      {/* Vista de ciclo de vida completo */}
      {activeTab === 'lifecycle' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notificación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creada por</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visualizaciones</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eliminación</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notificationLifecycles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay historial de notificaciones.
                  </td>
                </tr>
              ) : (
                notificationLifecycles.map((lifecycle, index) => (
                  <tr key={index} className={lifecycle.isActive ? 'bg-green-50' : 'bg-gray-50'}>
                    {/* Mensaje de notificación */}
                    <td className="px-6 py-4 whitespace-normal">
                      <div className="text-sm text-gray-900 font-medium">{lifecycle.message}</div>
                    </td>
                    
                    {/* Estado actual */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lifecycle.isActive ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Activa
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Eliminada
                        </span>
                      )}
                    </td>
                    
                    {/* Creador */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lifecycle.createdBy}</div>
                    </td>
                    
                    {/* Fecha de creación */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(lifecycle.createdAt)}</div>
                    </td>
                    
                    {/* Visualizaciones */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {lifecycle.viewRecords.length} usuarios
                      </div>
                      {lifecycle.viewRecords.length > 0 && (
                        <div className="mt-1 text-xs text-gray-500">
                          Última: {formatDate(lifecycle.viewRecords[lifecycle.viewRecords.length - 1]?.viewedAt || '')}
                        </div>
                      )}
                    </td>
                    
                    {/* Información de eliminación */}
                    <td className="px-6 py-4 whitespace-normal">
                      {lifecycle.deletedAt ? (
                        <>
                          <div className="text-sm text-gray-900">Por: {lifecycle.deletedBy}</div>
                          <div className="text-xs text-gray-500">{formatDate(lifecycle.deletedAt)}</div>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Contenido según pestaña activa - Vista detallada de creaciones */}
      {activeTab === 'created' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notificación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creada por</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de creación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visualizaciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {createdNotifications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay notificaciones creadas.
                  </td>
                </tr>
              ) : (
                createdNotifications.map((notification, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-normal">
                      <div className="text-sm text-gray-900">{notification.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{notification.createdByName || notification.createdBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(notification.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{notification.viewCount || 0}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {activeTab === 'deleted' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notificación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eliminada por</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de eliminación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creada por</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deletedNotifications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay notificaciones eliminadas.
                  </td>
                </tr>
              ) : (
                deletedNotifications.map((record, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-normal">
                      <div className="text-sm text-gray-900">{record.notificationMessage}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.deletedByName || record.deletedBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(record.deletedAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.originalCreatedBy || 'Desconocido'}</div>
                      {record.originalCreatedAt && (
                        <div className="text-xs text-gray-500">{formatDate(record.originalCreatedAt)}</div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-6 border-t pt-4 text-sm text-gray-600">
        <p>Este panel muestra el historial completo de notificaciones, incluyendo cuándo se crearon, fueron vistas y eliminadas.</p>
        <p className="mt-2">Solo administradores pueden acceder a esta información.</p>
      </div>
    </div>
  );
} 