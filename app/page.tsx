'use client';

import React, { useState, useEffect, useRef } from 'react';
import Tabs from './components/Tabs';
import DirectKPI from './components/dashboard/DirectKPI';
import StatusChart from './components/dashboard/StatusChart';
import UpcomingTasksList from './components/dashboard/UpcomingTasksList';
import DirectHighlighted from './components/dashboard/DirectHighlighted';
import TaskManager from './components/tasks/TaskManager';
import CalendarContainer from './components/calendar/CalendarContainer';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Task } from './lib/types';
import { TaskCountsType } from './lib/db';
import ProtectedRoute from './lib/auth/protected-route';
import { useAuth } from './lib/auth/auth-context';
import AlertNotification from './components/AlertNotification';
import NotificationHistory from './components/NotificationHistory';
import { setImportantNotification } from '@/app/lib/notification';

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
  
  // Estado para el modal de KPI
  const [showKpiModal, setShowKpiModal] = useState(false);
  const [kpiTitle, setKpiTitle] = useState('');
  const [kpiTasks, setKpiTasks] = useState<Task[]>([]);
  
  // Referencia al contenedor de pestañas
  const tabsSectionRef = useRef<HTMLDivElement>(null);
  
  // Estado para el modal del calendario
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Cargar datos usando fetch
  const loadData = async (forceCacheBypass = false) => {
    if (!user) return;
    
    console.log('🔄 Home - loadData: Iniciando carga de datos...');
    setIsLoading(true);
    setFetchError(null);
    
    try {
      // Añadir timestamp en la URL para evitar caché si se solicita
      const timestamp = forceCacheBypass ? `?t=${new Date().getTime()}` : '';
      
      console.log(`🔄 Home - loadData: Realizando peticiones a la API${forceCacheBypass ? ' (bypass caché)' : ''}...`);
      const [ 
        activeData, 
        allData, 
        countsData, 
        highlightedData, 
        lastUpdateData 
      ] = await Promise.all([
        fetchData<{ tasks: Task[] }>(`/api/tasks/active${timestamp}`),
        fetchData<{ tasks: Task[] }>(`/api/tasks${timestamp}`),
        fetchData<{ counts: TaskCountsType }>(`/api/tasks/counts${timestamp}`),
        fetchData<{ tasks: Task[] }>(`/api/tasks/highlighted${timestamp}`),
        fetchData<{ lastUpdate: string }>(`/api/tasks/last-update${timestamp}`)
      ]);

      console.log('🔄 Home - loadData: Peticiones completadas, actualizando estados...');
      console.log('📊 Tareas totales recibidas:', allData.tasks?.length || 0);
      console.log('📊 Tareas por id:', allData.tasks?.map(t => t.id).join(', '));
      console.log('📊 Tareas activas recibidas:', activeData.tasks?.length || 0);
      console.log('📊 Tareas destacadas recibidas:', highlightedData.tasks?.length || 0);
      console.log('📊 Destacadas IDs:', highlightedData.tasks?.map(t => t.id).join(', '));
      console.log('📊 Conteos por estado:', JSON.stringify(countsData.counts));
      
      // Calcular conteos de forma directa desde allData
      const pendienteCount = allData.tasks?.filter(t => t.status === 'Pendiente').length || 0;
      const progresoCount = allData.tasks?.filter(t => t.status === 'En Progreso').length || 0;
      const bloqueadaCount = allData.tasks?.filter(t => t.status === 'Bloqueada').length || 0;
      const terminadaCount = allData.tasks?.filter(t => t.status === 'Terminada').length || 0;
      
      console.log('📊 Conteos calculados directamente:');
      console.log('   - Pendiente:', pendienteCount);
      console.log('   - En Progreso:', progresoCount);
      console.log('   - Bloqueada:', bloqueadaCount);
      console.log('   - Terminada:', terminadaCount);
      
      // Tareas destacadas calculadas de forma directa
      const destacadasCalculadas = allData.tasks?.filter(t => t.highlighted).length || 0;
      console.log('📊 Tareas destacadas calculadas directamente:', destacadasCalculadas);
      
      // Actualizar estados en secuencia para asegurar re-renders
      setActiveTasks(activeData.tasks || []);
      setAllTasks(allData.tasks || []);
      setTaskCounts({
        'Pendiente': pendienteCount,
        'En Progreso': progresoCount,
        'Bloqueada': bloqueadaCount,
        'Terminada': terminadaCount
      });
      setHighlightedTasks(allData.tasks?.filter(t => t.highlighted) || []);
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
  
  // Filtrar tareas por estado para las pestañas
  const pendingTasks = allTasks.filter(task => task.status === 'Pendiente');
  const inProgressTasks = allTasks.filter(task => task.status === 'En Progreso');
  const blockedTasks = allTasks.filter(task => task.status === 'Bloqueada');
  const completedTasks = allTasks.filter(task => task.status === 'Terminada');
  
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

  // Mostrar modal con tareas según KPI
  const showTasksByKPI = (title: string, tasks: Task[]) => {
    setKpiTitle(title);
    setKpiTasks(tasks);
    setShowKpiModal(true);
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
    
    try {
      // Llamar a la API para crear la notificación
      await setImportantNotification(newNotification);
      
      setShowNotificationForm(false);
      setNewNotification('');
      setNotificationSuccess('Notificación guardada correctamente');
      setTimeout(() => setNotificationSuccess(null), 3000);
    } catch (error) {
      console.error('Error guardando notificación:', error);
      setNotificationSuccess('Error al guardar la notificación');
      setTimeout(() => setNotificationSuccess(null), 3000);
    }
  };
  
  // Callback para actualizar datos después de cambios en TaskManager
  const handleTasksUpdated = () => {
    console.log('🔄 Home - handleTasksUpdated: TaskManager actualizó tareas, recargando datos...');
    
    // Forzar estado de carga para actualizar la UI
    setIsLoading(true);
    
    // Realizar una carga inmediata con bypass de caché
    loadData(true);
    
    // Programar una segunda carga después de un retraso para asegurar
    // que todas las operaciones de base de datos se han completado
    setTimeout(() => {
      loadData(true);
      // Finalmente quitamos el estado de carga
      setIsLoading(false);
    }, 1000);
  };

  // Contenido de las pestañas
  const tabsContent = [
    {
      id: 'task-manager',
      label: 'Gestión de Tareas',
      content: <TaskManager initialTasks={allTasks} onTasksUpdated={handleTasksUpdated} />
    },
    {
      id: 'completed',
      label: 'Tareas Terminadas',
      content: isLoading ? (
        <div className="text-center p-4">Cargando tareas terminadas...</div>
      ) : (
        <div className="bg-white p-4 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Tareas Terminadas ({completedTasks.length})</h3>
          {completedTasks.length > 0 ? (
            <ul className="list-disc pl-4">
              {completedTasks.map(task => (
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
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  return (
    <ProtectedRoute>
      <div className="bg-gray-100 min-h-screen">
        {/* Barra de navegación superior */}
        <div className="bg-white shadow-sm p-2 flex justify-between items-center border-b border-gray-200">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">Tablero Dirección</h1>
          </div>
          <div className="flex items-center space-x-3">
            {notificationSuccess && (
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded border border-green-300">
                {notificationSuccess}
              </div>
            )}
            <button
              onClick={() => setShowNotificationForm(true)}
              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex items-center"
            >
              <span className="mr-1">🔔</span> Notificación
            </button>
            {user && (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <span className="mr-1">👤</span> {user.name} <span className="ml-1">▼</span>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <div className="py-1">
                      {user.username === 'admin' && (
                        <a
                          href="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        >
                          Panel Administrador
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setShowPasswordModal(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      >
                        Cambiar contraseña
                      </button>
                      <button 
                        onClick={() => {
                          handleLogout();
                          setIsUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Botón del Calendario */}
            <button
              onClick={() => setShowCalendar(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendario
            </button>
          </div>
        </div>
        
        {/* Sección principal con layout modificado */}
        <div className="container mx-auto py-6 px-4">
          {/* Notificaciones */}
          <AlertNotification />
          
          {/* Error de carga */}
          {fetchError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
              <p><strong>Error:</strong> {fetchError}</p>
              <button 
                onClick={() => loadData(true)} 
                className="mt-2 px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          )}
          
          {/* KPIs y tareas destacadas */}
          <div className="mb-8">
            {/* KPIs en fila */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <DirectKPI
                title="Total"
                value={taskCounts['Pendiente'] + taskCounts['En Progreso'] + taskCounts['Bloqueada'] + taskCounts['Terminada']}
                color="info"
                onClick={() => showTasksByKPI("Total", allTasks)}
              />
              <DirectKPI
                title="Pendientes"
                value={taskCounts['Pendiente']}
                color="warning"
                onClick={() => showTasksByKPI("Pendientes", pendingTasks)}
              />
              <DirectKPI
                title="En Progreso"
                value={taskCounts['En Progreso']}
                color="info"
                onClick={() => showTasksByKPI("En Progreso", inProgressTasks)}
              />
              <DirectKPI
                title="Detenidas"
                value={taskCounts['Bloqueada']}
                color="error"
                onClick={() => showTasksByKPI("Detenidas", blockedTasks)}
              />
            </div>
            
            {/* Grilla de Tareas Destacadas */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">⭐ Tareas destacadas</h2>
              <DirectHighlighted tasks={highlightedTasks} />
            </div>
          </div>
          
          {/* Sección de pestañas */}
          <div id="tabs-section" ref={tabsSectionRef} className="bg-white rounded-xl shadow-md p-6 transition-colors duration-500">
            <Tabs defaultTabId={activeTab} tabs={tabsContent} />
          </div>
          
          {/* Última actualización */}
          <div className="text-center text-sm text-gray-500 mt-4">
            Última actualización: {lastUpdate ? format(parseISO(lastUpdate), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es }) : 'No disponible'}
          </div>
        </div>
        
        {/* Modal para cambiar contraseña */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-full">
              <h2 className="text-xl font-bold mb-4">Cambiar contraseña</h2>
              
              <form onSubmit={handleChangePassword}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Contraseña actual</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Nueva contraseña</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Confirmar nueva contraseña</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                
                {passwordError && (
                  <div className="mb-4 text-red-500">{passwordError}</div>
                )}
                
                {passwordSuccess && (
                  <div className="mb-4 text-green-500">{passwordSuccess}</div>
                )}
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 text-gray-600 mr-2"
                    disabled={isPasswordLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    disabled={isPasswordLoading}
                  >
                    {isPasswordLoading ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Modal para notificación */}
        {showNotificationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-full">
              <h2 className="text-xl font-bold mb-4">Crear notificación destacada</h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Texto de la notificación</label>
                <textarea
                  value={newNotification}
                  onChange={(e) => setNewNotification(e.target.value)}
                  className="w-full px-3 py-2 border rounded h-32"
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowNotificationForm(false)}
                  className="px-4 py-2 text-gray-600 mr-2"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveNotification}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Guardar notificación
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal para tareas por KPI */}
        {showKpiModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-4/5 max-w-4xl max-h-[80vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Tareas: {kpiTitle} ({kpiTasks.length})</h2>
                <button 
                  onClick={() => setShowKpiModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
              
              {kpiTasks.length > 0 ? (
                <div className="overflow-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descripción
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Responsable
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha Importante
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {kpiTasks.map(task => (
                        <tr key={String(task.id)}>
                          <td className="px-6 py-4 whitespace-normal">
                            <div className="text-sm font-medium text-gray-900">{task.description}</div>
                            {task.comment && (
                              <div className="text-xs text-gray-500">{task.comment}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{task.responsible}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${task.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                                task.status === 'En Progreso' ? 'bg-blue-100 text-blue-800' : 
                                task.status === 'Bloqueada' ? 'bg-red-100 text-red-800' : 
                                'bg-green-100 text-green-800'}`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {task.importantDate || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500">No hay tareas disponibles para mostrar.</p>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowKpiModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal del Calendario */}
        {showCalendar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Calendario de Tareas</h2>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <CalendarContainer tasks={allTasks} />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 