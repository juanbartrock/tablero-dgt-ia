'use client';

import React, { useState, useEffect } from 'react';
import { getImportantNotification, setImportantNotification, clearImportantNotification } from '../lib/notification';
import { useRouter } from 'next/navigation';
import TaskManager from '../components/tasks/TaskManager';
import ProtectedRoute from '../lib/auth/protected-route';
import { useAuth } from '../lib/auth/auth-context';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { Task } from '../lib/types';

declare global {
  interface Window {
    updateNotification?: () => void;
  }
}

// Definición de tipos para las visitas y usuarios
interface Visit {
  id: number;
  userId: number;
  username: string;
  userName: string;
  timestamp: string;
}

interface User {
  id: number;
  username: string;
  name: string;
}

interface NotificationView {
  userId: number;
  username: string;
  userName: string;
  notificationId: number;
  notificationMessage: string;
  viewedAt: string;
}

interface NotificationItem {
  message: string;
  timestamp: number;
  createdBy: string;
  createdAt: string;
  createdById?: number;
  createdByName?: string;
  viewCount?: number;
}

interface DeletedNotification {
  notificationId: number;
  deletedBy: string;
  deletedByName?: string;
  deletedAt: string;
}

export default function AdminPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notification, setNotification] = useState<string>('');
  const [currentNotification, setCurrentNotification] = useState<NotificationItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('notifications');
  const [visits, setVisits] = useState<Visit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [userForm, setUserForm] = useState({ username: '', name: '', password: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [notificationText, setNotificationText] = useState('');
  const [notificationViews, setNotificationViews] = useState<NotificationView[]>([]);
  const [notificationsHistory, setNotificationsHistory] = useState<NotificationItem[]>([]);
  const [deletedNotifications, setDeletedNotifications] = useState<any[]>([]);
  
  // --- Nuevos estados para tareas en Admin --- 
  const [adminTasks, setAdminTasks] = useState<Task[]>([]);
  const [isAdminTasksLoading, setIsAdminTasksLoading] = useState(true);
  const [adminTasksError, setAdminTasksError] = useState<string | null>(null);
  // ------------------------------------------
  
  // Cargar datos iniciales y configurar actualización periódica
  useEffect(() => {
    const loadData = async () => {
      // Cargar todo en paralelo donde sea posible
      setIsAdminTasksLoading(true); // Iniciar carga de tareas
      await Promise.all([
          loadNotification(),
          loadVisits(),
          loadUsers(),
          loadAdminTasks() // Cargar tareas
      ]);
      loadNotificationData(); // Esta parece depender de datos en localStorage
      setIsAdminTasksLoading(false); // Finalizar carga de tareas (al menos el intento)
    };
    
    loadData();
    
    // Configurar actualización periódica de visitas
    const visitInterval = setInterval(() => {
      loadVisits();
    }, 10000); // Actualizar cada 10 segundos
    
    // Limpiar el mensaje de éxito después de 3 segundos
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => {
        clearTimeout(timer);
        clearInterval(visitInterval);
      };
    }
    
    return () => {
      clearInterval(visitInterval);
    };
  }, [successMessage]);

  // Cargar la notificación actual
  const loadNotification = async () => {
    try {
      // Intentar obtener desde localStorage directamente
      const storedNotification = localStorage.getItem('important_notification');
      if (storedNotification) {
        const data = JSON.parse(storedNotification);
        if (data.message) {
          setCurrentNotification(data);
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
  
  // Cargar las visitas
  const loadVisits = async () => {
    try {
      const response = await fetch('/api/auth/visits');
      if (!response.ok) {
        throw new Error('Error al cargar las visitas');
      }
      const data = await response.json();
      console.log('Datos de visitas recibidos:', data.visits);
      console.log('Total de visitas:', data.visits.length);
      setVisits(data.visits);
    } catch (error) {
      console.error('Error al cargar las visitas:', error);
    }
  };
  
  // Cargar los usuarios
  const loadUsers = async () => {
    try {
      const response = await fetch('/api/auth/users');
      if (!response.ok) {
        throw new Error('Error al cargar los usuarios');
      }
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error al cargar los usuarios:', error);
    }
  };

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
        // Verificar que el usuario exista antes de acceder a sus propiedades
        if (!user) {
          throw new Error('Usuario no autenticado');
        }

        // Guardar en localStorage directamente
        localStorage.setItem(
          'important_notification',
          JSON.stringify({ message: notification, timestamp: new Date().toISOString() })
        );
        
        setCurrentNotification({ 
          message: notification, 
          timestamp: Date.now(), 
          createdBy: user.username, 
          createdAt: new Date().toISOString(), 
          createdById: user.id, 
          createdByName: user.name, 
          viewCount: 0 
        });
        
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
  
  // Cambiar entre pestañas
  const changeTab = (tab: string) => {
    setActiveTab(tab);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormSubmitting(true);
    setFormError(null);

    try {
      const response = await fetch('/api/auth/users', {
        method: editingUser ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userForm,
          id: editingUser || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el usuario');
      }

      const data = await response.json();
      setUsers(data.users);
      setFormSuccess(editingUser ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
      setUserForm({ username: '', name: '', password: '' });
      setEditingUser(null);
    } catch (error) {
      console.error('Error al guardar el usuario:', error);
      setFormError('Error al guardar el usuario. Por favor, intente nuevamente.');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user.id);
    setUserForm({ username: user.username, name: user.name, password: '' });
  };

  const handleDeleteUser = async (id: number) => {
    setIsDeletingUser(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/auth/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el usuario');
      }

      const data = await response.json();
      setUsers(data.users);
      setSuccessMessage('Usuario eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      setMessage('Error al eliminar el usuario. Por favor, intente nuevamente.');
    } finally {
      setIsDeletingUser(false);
    }
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setUserForm({ username: '', name: '', password: '' });
  };

  const loadNotificationData = () => {
    try {
      // Cargar historial de notificaciones creadas
      const history = localStorage.getItem('created_notifications');
      if (history) {
        const parsed = JSON.parse(history);
        // Ordenar por fecha (más recientes primero)
        const sorted = parsed.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNotificationsHistory(sorted);
      }
      
      // Cargar vistas de notificaciones
      const views = localStorage.getItem('viewed_notifications');
      if (views) {
        const parsed = JSON.parse(views);
        // Ordenar por fecha (más recientes primero)
        const sorted = parsed.sort((a: any, b: any) => 
          new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
        );
        setNotificationViews(sorted);
      }
      
      // Cargar notificaciones eliminadas
      const deleted = localStorage.getItem('deleted_notifications');
      if (deleted) {
        setDeletedNotifications(JSON.parse(deleted));
      }
    } catch (error) {
      console.error('Error al cargar datos de notificaciones:', error);
    }
  };
  
  const handleNotificationSave = () => {
    if (!notificationText.trim() || !user) return;
    
    try {
      // Crear objeto de notificación
      const notification = {
        message: notificationText,
        timestamp: Date.now(),
        createdBy: user.username,
        createdAt: new Date().toISOString(),
        createdById: user.id,
        createdByName: user.name,
        viewCount: 0
      };
      
      // Guardar como notificación actual
      localStorage.setItem('important_notification', JSON.stringify(notification));
      
      // Agregar al historial
      let history = [];
      const existingHistory = localStorage.getItem('created_notifications');
      if (existingHistory) {
        history = JSON.parse(existingHistory);
      }
      history.push(notification);
      localStorage.setItem('created_notifications', JSON.stringify(history));
      
      // Actualizar estado
      setCurrentNotification(notification);
      setNotificationsHistory([notification, ...notificationsHistory]);
      setNotificationText('');
      
      alert('Notificación creada correctamente');
    } catch (error) {
      console.error('Error al guardar notificación:', error);
      alert('Error al guardar la notificación');
    }
  };
  
  const handleNotificationDelete = () => {
    if (!currentNotification || !user) {
      alert('No hay notificación activa para eliminar');
      return;
    }
    
    try {
      // Crear registro de eliminación
      const deletionRecord = {
        notificationId: currentNotification.timestamp,
        notificationMessage: currentNotification.message,
        deletedBy: user.username,
        deletedByName: user.name,
        deletedById: user.id,
        deletedAt: new Date().toISOString(),
        originalCreatedBy: currentNotification.createdBy,
        originalCreatedAt: currentNotification.createdAt
      };
      
      // Agregar al historial de eliminaciones
      let deletions = [];
      const existingDeletions = localStorage.getItem('deleted_notifications');
      if (existingDeletions) {
        deletions = JSON.parse(existingDeletions);
      }
      deletions.push(deletionRecord);
      localStorage.setItem('deleted_notifications', JSON.stringify(deletions));
      
      // Eliminar notificación actual
      localStorage.removeItem('important_notification');
      
      // Actualizar estado
      setCurrentNotification(null);
      setDeletedNotifications([...deletedNotifications, deletionRecord]);
      
      alert('Notificación eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      alert('Error al eliminar la notificación');
    }
  };
  
  // Función para formatear fecha
  const formatDate = (dateString: string) => {
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
      return dateString;
    }
  };
  
  // Verificar si el usuario es administrador
  if (!user || user.username !== 'admin') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl text-red-600 mb-4">Acceso denegado</h1>
        <p className="mb-4">No tienes permisos para acceder al panel de administración.</p>
        <Link href="/" className="text-blue-600 hover:underline">Volver al inicio</Link>
      </div>
    );
  }
  
  // Encontrar las vistas para una notificación específica
  const getViewsForNotification = (notificationId: number) => {
    return notificationViews.filter(view => view.notificationId === notificationId);
  };
  
  // Verificar si una notificación está eliminada
  const isNotificationDeleted = (notificationId: number) => {
    return deletedNotifications.some(deleted => deleted.notificationId === notificationId);
  };
  
  // Obtener información de eliminación
  const getDeletionInfo = (notificationId: number) => {
    return deletedNotifications.find(deleted => deleted.notificationId === notificationId);
  };

  // Función para eliminar todas las notificaciones y su historial
  const handleDeleteAllNotifications = () => {
    if (confirm('¿Estás seguro de que deseas eliminar TODAS las notificaciones y su historial? Esta acción no se puede deshacer.')) {
      try {
        // Eliminar notificación actual
        localStorage.removeItem('important_notification');
        
        // Eliminar el historial de notificaciones creadas
        localStorage.removeItem('created_notifications');
        
        // Eliminar el historial de notificaciones vistas
        localStorage.removeItem('viewed_notifications');
        
        // Eliminar el historial de notificaciones eliminadas
        localStorage.removeItem('deleted_notifications');
        
        // Actualizar estados
        setCurrentNotification(null);
        setNotificationsHistory([]);
        setNotificationViews([]);
        setDeletedNotifications([]);
        
        alert('Todos los datos de notificaciones han sido eliminados correctamente.');
      } catch (error) {
        console.error('Error al eliminar datos de notificaciones:', error);
        alert('Ocurrió un error al eliminar las notificaciones.');
      }
    }
  };

  // --- Nueva función para cargar tareas --- 
  const loadAdminTasks = async () => {
      setAdminTasksError(null);
      // No ponemos loading aquí porque se controla en el useEffect principal
      // setIsAdminTasksLoading(true); 
      try {
          const response = await fetch('/api/tasks');
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Error al cargar las tareas');
          }
          const data = await response.json();
          setAdminTasks(data.tasks || []);
      } catch (error: any) {
          console.error('Error al cargar las tareas (Admin):', error);
          setAdminTasksError(error.message || 'No se pudieron cargar las tareas.');
          setAdminTasks([]); // Limpiar tareas en caso de error
      } finally {
         // Ya no controlamos loading aquí directamente
         // setIsAdminTasksLoading(false);
      }
  };
  // --------------------------------------

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
            <p className="text-gray-600">Gestione la configuración del sistema</p>
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
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}
        
        {message && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{message}</span>
          </div>
        )}
        
        {/* Tabs de navegación */}
        <div className="border-b border-gray-200 mb-4">
          <ul className="flex flex-wrap -mb-px">
            <li className="mr-2">
              <button
                className={`inline-block py-2 px-4 text-sm font-medium ${
                  activeTab === 'notifications'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => changeTab('notifications')}
              >
                Notificaciones
              </button>
            </li>
            <li className="mr-2">
              <button
                className={`inline-block py-2 px-4 text-sm font-medium ${
                  activeTab === 'users'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => changeTab('users')}
              >
                Administración de Usuarios
              </button>
            </li>
            <li className="mr-2">
              <button
                className={`inline-block py-2 px-4 text-sm font-medium ${
                  activeTab === 'visits'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => changeTab('visits')}
              >
                Registro de Visitas
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => changeTab('tasks')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'tasks'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Gestión de Tareas
              </button>
            </li>
          </ul>
        </div>
        
        {/* Contenido de la pestaña activa */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Sección de Notificaciones */}
          {activeTab === 'notifications' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Notificación Importante</h2>
                <button 
                  onClick={handleDeleteAllNotifications}
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700"
                >
                  Eliminar TODAS las notificaciones
                </button>
              </div>
              <p className="text-gray-600 mb-4">
                Esta notificación se mostrará en la parte superior de la aplicación para todos los usuarios.
              </p>
              
              {currentNotification ? (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-medium text-red-800">{currentNotification.message}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        Creada por: {currentNotification.createdByName || currentNotification.createdBy} | 
                        Fecha: {formatDate(currentNotification.createdAt)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Vista por {getViewsForNotification(currentNotification.timestamp).length} usuarios
                      </p>
                    </div>
                    <button 
                      onClick={handleNotificationDelete}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Eliminar Notificación
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <p className="text-gray-500 italic mb-4">No hay notificación activa.</p>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-medium mb-3">Crear Nueva Notificación</h3>
                <div className="mb-4">
                  <label htmlFor="notificationText" className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje de notificación
                  </label>
                  <textarea
                    id="notificationText"
                    value={notificationText}
                    onChange={(e) => setNotificationText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Escribe el mensaje de notificación aquí..."
                  ></textarea>
                </div>
                <button
                  onClick={handleNotificationSave}
                  disabled={!notificationText.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
                >
                  Guardar Notificación
                </button>
              </div>
            </div>
          )}
          
          {/* Sección de Administración de Usuarios */}
          {activeTab === 'users' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Administración de Usuarios</h2>
              
              {/* Formulario para agregar/editar usuarios */}
              <div className="bg-white p-4 rounded-md shadow-sm mb-6 border border-gray-200">
                <h3 className="text-lg font-medium mb-3">
                  {editingUser ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
                </h3>
                
                {formError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    <span className="block sm:inline">{formError}</span>
                  </div>
                )}
                
                {formSuccess && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                    <span className="block sm:inline">{formSuccess}</span>
                  </div>
                )}
                
                <form onSubmit={handleUserSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de Usuario
                      </label>
                      <input
                        type="text"
                        id="username"
                        value={userForm.username}
                        onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={userForm.name}
                        onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        {editingUser ? 'Nueva Contraseña (dejar en blanco para mantener la actual)' : 'Contraseña'}
                      </label>
                      <input
                        type="password"
                        id="password"
                        value={userForm.password}
                        onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required={!editingUser}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    {editingUser && (
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-400"
                        disabled={isFormSubmitting}
                      >
                        Cancelar
                      </button>
                    )}
                    
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      disabled={isFormSubmitting}
                    >
                      {isFormSubmitting 
                        ? (editingUser ? 'Actualizando...' : 'Creando...') 
                        : (editingUser ? 'Actualizar Usuario' : 'Crear Usuario')}
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Tabla de usuarios */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Usuario
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nombre
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.length > 0 ? (
                          users.map((user) => (
                            <tr key={user.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {user.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {user.username}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {user.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEditUser(user)}
                                    className="text-blue-600 hover:text-blue-900"
                                    disabled={isFormSubmitting}
                                  >
                                    Editar
                                  </button>
                                  {user.id !== 1 && (
                                    <button
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="text-red-600 hover:text-red-900"
                                      disabled={isFormSubmitting || isDeletingUser}
                                    >
                                      Eliminar
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                              No hay usuarios para mostrar
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Sección de Registro de Visitas */}
          {activeTab === 'visits' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Registro de Visitas</h2>
              
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha y Hora
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visits.length > 0 ? (
                      visits.map((visit) => (
                        <tr key={visit.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {visit.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {visit.userName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(parseISO(visit.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                          No hay visitas registradas
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Sección de Gestión de Tareas */}
          {activeTab === 'tasks' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Gestión de Tareas</h2>
              {adminTasksError && (
                   <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                      Error al cargar tareas: {adminTasksError}
                   </div>
              )}
              {/* Mostrar carga o TaskManager */} 
              {isAdminTasksLoading ? (
                  <div className="text-center p-4">
                      <p className="text-gray-500">Cargando tareas...</p>
                  </div>
              ) : adminTasksError ? null : ( // No mostrar TaskManager si hubo error
                  <> {/* Log ya no es necesario aquí si controlamos carga */} 
                      {/* {(() => { console.log('AdminPage - Rendering TaskManager with initialTasks:', adminTasks); return null; })()} */}
                      <TaskManager 
                          initialTasks={adminTasks} 
                          onTasksUpdated={loadAdminTasks} 
                      />
                  </>
              )}
            </div>
          )}

          <div className="mb-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-6">Historial de Notificaciones</h2>
            
            {notificationsHistory.length === 0 ? (
              <p className="text-gray-500 italic">No hay historial de notificaciones.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notificación</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creada por</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de creación</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vistas</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {notificationsHistory.map((notification, index) => {
                      const isActive = currentNotification?.timestamp === notification.timestamp;
                      const isDeleted = isNotificationDeleted(notification.timestamp);
                      const deletionInfo = getDeletionInfo(notification.timestamp);
                      const views = getViewsForNotification(notification.timestamp);
                      
                      return (
                        <tr key={index} className={isActive ? 'bg-green-50' : isDeleted ? 'bg-gray-100' : ''}>
                          <td className="px-6 py-4 whitespace-normal">
                            <div className="text-sm font-medium text-gray-900">{notification.message}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{notification.createdByName || notification.createdBy}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(notification.createdAt)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isActive ? (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Activa
                              </span>
                            ) : isDeleted ? (
                              <div>
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                  Eliminada
                                </span>
                                {deletionInfo && (
                                  <div className="mt-1 text-xs text-gray-500">
                                    Por: {deletionInfo.deletedByName || deletionInfo.deletedBy}<br/>
                                    {formatDate(deletionInfo.deletedAt)}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                Inactiva
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{views.length} usuarios</div>
                            {views.length > 0 && (
                              <div className="mt-1">
                                <details className="text-xs text-gray-500">
                                  <summary className="cursor-pointer hover:text-blue-500">Ver detalles</summary>
                                  <ul className="mt-1 pl-2 border-l-2 border-gray-200">
                                    {views.map((view, vidx) => (
                                      <li key={vidx} className="mb-1">
                                        <span className="font-medium">{view.userName || view.username}</span> - {formatDate(view.viewedAt)}
                                      </li>
                                    ))}
                                  </ul>
                                </details>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 