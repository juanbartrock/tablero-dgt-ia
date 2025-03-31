'use client';

import React, { useState, useEffect, useRef } from 'react';
import Tabs from './components/Tabs';
import KPICard from './components/dashboard/KPICard';
import StatusChart from './components/dashboard/StatusChart';
import UpcomingTasksList from './components/dashboard/UpcomingTasksList';
import HighlightedTasksList from './components/dashboard/HighlightedTasksList';
import TaskManager from './components/tasks/TaskManager';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Task } from './lib/types';
import { TaskCountsType } from './lib/db';
import ProtectedRoute from './lib/auth/protected-route';
import { useAuth } from './lib/auth/auth-context';
import AlertNotification from './components/AlertNotification';
import NotificationHistory from './components/NotificationHistory';

// Helper para llamadas fetch (opcional pero útil)
async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    // Podríamos intentar leer el mensaje de error de la respuesta JSON
    let errorMsg = `HTTP error! status: ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMsg = errorBody.message || errorMsg;
    } catch (e) { /* Ignorar si el cuerpo no es JSON */ }
    throw new Error(errorMsg);
  }
  return response.json();
}

export default function Home() {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [highlightedTasks, setHighlightedTasks] = useState<Task[]>([]);
  const [taskCounts, setTaskCounts] = useState<TaskCountsType>({ 'Pendiente': 0, 'En Progreso': 0, 'Bloqueada': 0, 'Terminada': 0 });
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState('task-manager');
  const [isScrolling, setIsScrolling] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Estados para el modal de cambio de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  
  // Estado para el modal de notificación
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [newNotification, setNewNotification] = useState('');
  const [notificationSuccess, setNotificationSuccess] = useState<string | null>(null);
  
  // Referencia al contenedor de pestañas
  const tabsSectionRef = useRef<HTMLDivElement>(null);
  
  // Cargar datos usando fetch
  const loadData = async () => {
    if (!user) return;
    
    console.log('🔄 Home - loadData: Iniciando carga de datos...');
    setIsLoading(true);
    setFetchError(null);
    
    try {
      console.log('🔄 Home - loadData: Realizando peticiones a la API...');
      const [ 
        activeData, 
        allData, 
        countsData, 
        highlightedData, 
        lastUpdateData 
      ] = await Promise.all([
        fetchData<{ tasks: Task[] }>('/api/tasks/active'),
        fetchData<{ tasks: Task[] }>('/api/tasks'),
        fetchData<{ counts: TaskCountsType }>('/api/tasks/counts'),
        fetchData<{ tasks: Task[] }>('/api/tasks/highlighted'),
        fetchData<{ lastUpdate: string }>('/api/tasks/last-update')
      ]);

      console.log('🔄 Home - loadData: Peticiones completadas, actualizando estados...');
      console.log('📊 Tareas totales recibidas:', allData.tasks?.length || 0);
      console.log('📊 Tareas destacadas recibidas:', highlightedData.tasks?.length || 0);
      
      setActiveTasks(activeData.tasks || []);
      setAllTasks(allData.tasks || []);
      setTaskCounts(countsData.counts || { 'Pendiente': 0, 'En Progreso': 0, 'Bloqueada': 0, 'Terminada': 0 });
      setHighlightedTasks(highlightedData.tasks || []);
      setLastUpdate(lastUpdateData.lastUpdate || new Date().toISOString());
      console.log('✅ Home - loadData: Estados actualizados correctamente');
      
    } catch (error: any) {
      console.error('❌ Error al cargar los datos:', error);
      setFetchError(error.message || 'Ocurrió un error al cargar los datos.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      loadData();
      
      const intervalId = setInterval(loadData, 5 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    } else {
      setActiveTasks([]);
      setAllTasks([]);
      setTaskCounts({ 'Pendiente': 0, 'En Progreso': 0, 'Bloqueada': 0, 'Terminada': 0 });
      setHighlightedTasks([]);
      setLastUpdate('');
      setIsLoading(false);
      setFetchError(null);
    }
  }, [user]);
  
  // Datos para el gráfico de estado
  const statusData = [
    { name: 'Pendiente', value: taskCounts['Pendiente'] },
    { name: 'En Progreso', value: taskCounts['En Progreso'] },
    { name: 'Bloqueada', value: taskCounts['Bloqueada'] }
  ];
  
  // Obtener tareas próximas (ahora usa allTasks y filtra)
  const upcomingTasks = allTasks
    .filter(task => task.status !== 'Terminada' && task.importantDate)
    .sort((a, b) => {
      if (!a.importantDate || !b.importantDate) return 0;
      return a.importantDate.localeCompare(b.importantDate);
    })
    .slice(0, 5);
  
  // Navegar a una sección específica mediante hash
  const navigateToSection = (tabId: string) => {
    if (isScrolling) return;
    
    setIsScrolling(true);
    
    window.location.hash = tabId;
    
    setTimeout(() => {
      const tabsSection = document.getElementById('tabs-section');
      if (tabsSection) {
        tabsSection.classList.add('highlight-section');
        
        setTimeout(() => {
          tabsSection.classList.remove('highlight-section');
          setIsScrolling(false);
        }, 1000);
      } else {
        setIsScrolling(false);
      }
    }, 100);
  };

  // Manejar cierre de sesión
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };
  
  // Función para cambiar la contraseña
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!user) {
      setPasswordError('No hay sesión activa. Por favor, inicie sesión nuevamente.');
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Todos los campos son obligatorios');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('La nueva contraseña y su confirmación no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setIsPasswordLoading(true);
      
      const response = await fetch(`/api/auth/users/${user.id}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPasswordError(data.message || 'Error al cambiar la contraseña');
        return;
      }

      setPasswordSuccess('Contraseña actualizada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(null);
      }, 2000);
      
    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      setPasswordError('Error de conexión con el servidor');
    } finally {
      setIsPasswordLoading(false);
    }
  };
  
  // Función para guardar notificación
  const handleSaveNotification = async () => {
    if (!newNotification.trim() || !user) return;
    
    console.warn('TODO: Implementar API para guardar notificaciones en DB');
    
    try {
      const notification = {
        message: newNotification,
        timestamp: Date.now(),
        createdBy: user.username,
        createdAt: new Date().toISOString(),
        createdById: user.id,
        createdByName: user.name,
        status: 'active',
        viewCount: 0
      };
      console.log('Guardando notificación (localStorage - temporal):', notification);
      localStorage.setItem('important_notification', JSON.stringify(notification));
      
      setShowNotificationForm(false);
      setNewNotification('');
      setNotificationSuccess('Notificación (temporal) guardada localmente.');
      setTimeout(() => setNotificationSuccess(null), 3000);
    } catch (error) {
      console.error('Error guardando notificación (localStorage):', error);
    }
  };
  
  // Callback para actualizar datos después de cambios en TaskManager
  const handleTasksUpdated = () => {
    console.log('TaskManager updated tasks, reloading data...');
    loadData();
  };

  // Contenido de las pestañas
  const tabsContent = [
    {
      id: 'task-manager',
      label: 'Gestión de Tareas',
      content: <TaskManager initialTasks={allTasks} onTasksUpdated={handleTasksUpdated} />
    },
    {
      id: 'pending',
      label: 'Tareas Pendientes',
      content: isLoading ? (
        <div className="text-center p-4">Cargando tareas pendientes...</div>
      ) : (
        <div className="bg-white p-4 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Tareas Pendientes ({activeTasks.length})</h3>
          {activeTasks.length > 0 ? (
            <ul className="list-disc pl-4">
              {activeTasks.map(task => (
                <li key={String(task.id)} className="mb-2">
                  <span className="font-medium">{task.description}</span>
                  <div className="text-sm text-gray-500">
                    <span>Responsable: {task.responsible}</span>
                    {task.importantDate && (
                      <span className="ml-2">| Fecha importante: {task.importantDate}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No hay tareas pendientes.</p>
          )}
        </div>
      )
    },
    {
      id: 'in-progress',
      label: 'Tareas En Progreso',
      content: isLoading ? (
        <div className="text-center p-4">Cargando tareas en progreso...</div>
      ) : (
        <div className="bg-white p-4 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Tareas En Progreso ({activeTasks.length})</h3>
          {activeTasks.length > 0 ? (
            <ul className="list-disc pl-4">
              {activeTasks.map(task => (
                <li key={String(task.id)} className="mb-2">
                  <span className="font-medium">{task.description}</span>
                  <div className="text-sm text-gray-500">
                    <span>Responsable: {task.responsible}</span>
                    {task.importantDate && (
                      <span className="ml-2">| Fecha importante: {task.importantDate}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No hay tareas en progreso.</p>
          )}
        </div>
      )
    },
    {
      id: 'blocked',
      label: 'Tareas Detenidas',
      content: isLoading ? (
        <div className="text-center p-4">Cargando tareas detenidas...</div>
      ) : (
        <div className="bg-white p-4 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Tareas Detenidas ({activeTasks.length})</h3>
          {activeTasks.length > 0 ? (
            <ul className="list-disc pl-4">
              {activeTasks.map(task => (
                <li key={String(task.id)} className="mb-2">
                  <span className="font-medium">{task.description}</span>
                  <div className="text-sm text-gray-500">
                    <span>Responsable: {task.responsible}</span>
                    {task.importantDate && (
                      <span className="ml-2">| Fecha importante: {task.importantDate}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No hay tareas detenidas.</p>
          )}
        </div>
      )
    },
    {
      id: 'completed',
      label: 'Tareas Terminadas',
      content: isLoading ? (
        <div className="text-center p-4">Cargando tareas terminadas...</div>
      ) : (
        <div className="bg-white p-4 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Tareas Terminadas ({activeTasks.length})</h3>
          {activeTasks.length > 0 ? (
            <ul className="list-disc pl-4">
              {activeTasks.map(task => (
                <li key={String(task.id)} className="mb-2">
                  <span className="font-medium">{task.description}</span>
                  <div className="text-sm text-gray-500">
                    <span>Responsable: {task.responsible}</span>
                    {task.importantDate && (
                      <span className="ml-2">| Fecha importante: {task.importantDate}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No hay tareas terminadas.</p>
          )}
        </div>
      )
    }
  ];
  
  return (
    <>
      <AlertNotification />
      
      <ProtectedRoute>
        <div className="bg-gradient-to-br from-blue-50 to-slate-100 rounded-lg p-6 shadow-sm">
          {/* Dashboard */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent drop-shadow-sm">Estado de Tareas</h1>
                <div className="h-1 w-24 bg-gradient-to-r from-primary to-info rounded-full mt-2"></div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-500 bg-white px-3 py-2 rounded-md shadow-sm border border-gray-100">
                  Última actualización: {lastUpdate ? format(parseISO(lastUpdate), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es }) : ''}
                </p>
                <div className="flex items-center gap-2">
                  {user && (
                    <div className="relative">
                      <div 
                        className="px-3 py-2 bg-white rounded-md shadow-sm border border-gray-100 text-sm cursor-pointer flex items-center"
                        onClick={() => document.getElementById('userDropdown')?.classList.toggle('hidden')}
                      >
                        Usuario: <span className="font-medium ml-1">{user.name}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      
                      {/* Menú desplegable de usuario */}
                      <div id="userDropdown" className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 py-1">
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => {
                            document.getElementById('userDropdown')?.classList.add('hidden');
                            setShowPasswordModal(true);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          Cambiar contraseña
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => {
                            document.getElementById('userDropdown')?.classList.add('hidden');
                            setShowNotificationForm(true);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Crear notificación
                        </button>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md shadow-sm text-sm font-medium transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                  {user && user.username === 'admin' && (
                    <a href="/admin" className="px-4 py-2 bg-gradient-to-r from-primary to-info text-white rounded-md shadow-sm hover:shadow-md transition-all duration-200 text-sm font-medium flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Administración
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <div className="grid grid-cols-2 gap-3 h-full">
                <KPICard title="Total" value={activeTasks.length} color="success" onClick={() => navigateToSection('task-manager')} />
                <KPICard title="Pendientes" value={taskCounts['Pendiente']} color="warning" onClick={() => navigateToSection('pending')} />
                <KPICard title="En Progreso" value={taskCounts['En Progreso']} color="info" onClick={() => navigateToSection('in-progress')} />
                <KPICard title="Detenida" value={taskCounts['Bloqueada']} color="error" onClick={() => navigateToSection('blocked')} />
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <HighlightedTasksList tasks={highlightedTasks} />
            </div>
          </div>
          
          {/* Sección de Gestión de Tareas */}
          <div className="border-t border-blue-100 pt-6" id="tabs-section" ref={tabsSectionRef}>
            <Tabs tabs={tabsContent} defaultTabId={activeTab} />
          </div>
          
          {/* Historial de notificaciones (solo para admins) */}
          {user && user.username === 'admin' && (
            <div className="border-t border-blue-100 mt-8 pt-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Administración de Notificaciones</h2>
              <div className="bg-white rounded-lg shadow-sm p-0">
                <NotificationHistory />
              </div>
            </div>
          )}
          
          {/* Modal para cambiar contraseña */}
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-primary to-info">
                  <h3 className="text-lg font-medium text-white">Cambiar Contraseña</h3>
                </div>
                
                <div className="p-6">
                  {passwordError && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700" role="alert">
                      <p>{passwordError}</p>
                    </div>
                  )}
                  
                  {passwordSuccess && (
                    <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 text-green-700" role="alert">
                      <p>{passwordSuccess}</p>
                    </div>
                  )}
                  
                  <form onSubmit={handleChangePassword}>
                    <div className="mb-4">
                      <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña actual
                      </label>
                      <input
                        id="current-password"
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva contraseña
                      </label>
                      <input
                        id="new-password"
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar nueva contraseña
                      </label>
                      <input
                        id="confirm-password"
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        onClick={() => {
                          setShowPasswordModal(false);
                          setPasswordError(null);
                          setPasswordSuccess(null);
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={isPasswordLoading}
                      >
                        {isPasswordLoading ? 'Guardando...' : 'Cambiar Contraseña'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
          
          {/* Modal para crear notificación */}
          {showNotificationForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600">
                  <h3 className="text-lg font-medium text-white">Crear Notificación Importante</h3>
                </div>
                
                <div className="p-6">
                  {notificationSuccess && (
                    <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 text-green-700" role="alert">
                      <p>{notificationSuccess}</p>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label htmlFor="notification-text" className="block text-sm font-medium text-gray-700 mb-1">
                      Mensaje de notificación
                    </label>
                    <textarea
                      id="notification-text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      value={newNotification}
                      onChange={(e) => setNewNotification(e.target.value)}
                      placeholder="Escribe el mensaje de notificación aquí..."
                      rows={4}
                      required
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Esta notificación será visible para todos los usuarios del sistema. Se mostrará en la parte superior de la página.
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      onClick={() => {
                        setShowNotificationForm(false);
                        setNewNotification('');
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={handleSaveNotification}
                      disabled={!newNotification.trim()}
                    >
                      Publicar Notificación
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Estilos para el destacado de secciones */}
          <style jsx global>{`
            @keyframes highlightFade {
              0% { background-color: rgba(59, 130, 246, 0.1); }
              100% { background-color: transparent; }
            }
            
            .highlight-section {
              animation: highlightFade 1s ease-out;
            }
          `}</style>
        </div>
      </ProtectedRoute>
    </>
  );
} 