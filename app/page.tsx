'use client';

import React, { useState, useEffect, useRef } from 'react';
import Tabs from './components/Tabs';
import DirectKPI from './components/dashboard/DirectKPI';
import StatusChart from './components/dashboard/StatusChart';
import UpcomingTasksList from './components/dashboard/UpcomingTasksList';
import DirectHighlighted from './components/dashboard/DirectHighlighted';
import TaskManager from './components/tasks/TaskManager';
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
  
  // Referencia al contenedor de pestañas
  const tabsSectionRef = useRef<HTMLDivElement>(null);
  
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
      id: 'pending',
      label: 'Tareas Pendientes',
      content: isLoading ? (
        <div className="text-center p-4">Cargando tareas pendientes...</div>
      ) : (
        <div className="bg-white p-4 rounded shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Tareas Pendientes ({pendingTasks.length})</h3>
          {pendingTasks.length > 0 ? (
            <ul className="list-disc pl-4">
              {pendingTasks.map(task => (
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
          <h3 className="text-lg font-semibold mb-4">Tareas En Progreso ({inProgressTasks.length})</h3>
          {inProgressTasks.length > 0 ? (
            <ul className="list-disc pl-4">
              {inProgressTasks.map(task => (
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
          <h3 className="text-lg font-semibold mb-4">Tareas Detenidas ({blockedTasks.length})</h3>
          {blockedTasks.length > 0 ? (
            <ul className="list-disc pl-4">
              {blockedTasks.map(task => (
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
  
  return (
    <ProtectedRoute>
      <div className="bg-gray-100 min-h-screen">
        {/* Barra de navegación superior */}
        <div className="bg-white shadow-sm p-2 flex justify-between items-center border-b border-gray-200">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold ml-2">Tablero Dirección</h1>
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
              <>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Cambiar contraseña
                </button>
                <button 
                  onClick={handleLogout}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Cerrar sesión
                </button>
              </>
            )}
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
                onClick={() => navigateToSection('task-manager')}
              />
              <DirectKPI
                title="Pendientes"
                value={taskCounts['Pendiente']}
                color="warning"
                onClick={() => navigateToSection('pending')}
              />
              <DirectKPI
                title="En Progreso"
                value={taskCounts['En Progreso']}
                color="info"
                onClick={() => navigateToSection('in-progress')}
              />
              <DirectKPI
                title="Detenidas"
                value={taskCounts['Bloqueada']}
                color="error"
                onClick={() => navigateToSection('blocked')}
              />
            </div>
            
            {/* Grilla de Tareas Destacadas */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Grilla de Tareas Destacadas</h2>
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
      </div>
    </ProtectedRoute>
  );
} 