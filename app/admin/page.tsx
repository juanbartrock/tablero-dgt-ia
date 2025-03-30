'use client';

import React, { useState, useEffect } from 'react';
import { getImportantNotification, setImportantNotification, clearImportantNotification } from '../lib/notification';
import { useRouter } from 'next/navigation';
import TaskManager from '../components/tasks/TaskManager';
import ProtectedRoute from '../lib/auth/protected-route';
import { useAuth } from '../lib/auth/auth-context';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

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

interface ViewedNotification {
  userId: number;
  username: string;
  userName: string;
  notificationId: string;
  notificationMessage: string;
  viewedAt: string;
}

export default function AdminPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notification, setNotification] = useState<string>('');
  const [currentNotification, setCurrentNotification] = useState<string | null>(null);
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
  const [viewedNotifications, setViewedNotifications] = useState<ViewedNotification[]>([]);
  
  // Cargar datos iniciales y configurar actualización periódica
  useEffect(() => {
    const loadData = async () => {
      await loadNotification();
      await loadVisits();
      await loadUsers();
      loadViewedNotifications();
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

  // Cargar las notificaciones vistas
  const loadViewedNotifications = () => {
    try {
      const viewedData = localStorage.getItem('viewed_notifications');
      if (viewedData) {
        const data = JSON.parse(viewedData);
        setViewedNotifications(data);
      } else {
        setViewedNotifications([]);
      }
    } catch (error) {
      console.error('Error al cargar el historial de notificaciones:', error);
      setViewedNotifications([]);
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
                className={`inline-block py-2 px-4 text-sm font-medium ${
                  activeTab === 'tasks'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => changeTab('tasks')}
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
              <h2 className="text-xl font-semibold mb-4">Notificación Importante</h2>
              <p className="text-gray-600 mb-4">
                Esta notificación se mostrará en la parte superior de la aplicación para todos los usuarios.
              </p>
              
              {currentNotification && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
                  <p className="font-medium">Notificación actual:</p>
                  <p className="text-red-700">{currentNotification}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="notification" className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje de Notificación
                  </label>
                  <textarea
                    id="notification"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    value={notification}
                    onChange={(e) => setNotification(e.target.value)}
                    placeholder="Ingrese el mensaje de notificación importante..."
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Guardando...' : 'Guardar Notificación'}
                  </button>
                  
                  {currentNotification && (
                    <button
                      type="button"
                      className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      onClick={handleClear}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Eliminando...' : 'Eliminar Notificación'}
                    </button>
                  )}
                </div>
              </form>
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
          
          {/* Nueva sección de historial de notificaciones vistas */}
          {activeTab === 'notifications' && viewedNotifications.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Historial de Notificaciones Vistas</h3>
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
                        Notificación
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha y Hora de Vista
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {viewedNotifications.map((notification, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {notification.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {notification.userName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {notification.notificationMessage}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(parseISO(notification.viewedAt), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Sección de Gestión de Tareas */}
          {activeTab === 'tasks' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Gestión de Tareas</h2>
              <TaskManager />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 