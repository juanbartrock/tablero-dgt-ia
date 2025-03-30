'use client';

import React, { useState, useEffect, useRef } from 'react';
import Tabs from './components/Tabs';
import KPICard from './components/dashboard/KPICard';
import StatusChart from './components/dashboard/StatusChart';
import UpcomingTasksList from './components/dashboard/UpcomingTasksList';
import HighlightedTasksList from './components/dashboard/HighlightedTasksList';
import TaskManager from './components/tasks/TaskManager';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Task } from './lib/types';
import { taskApiClient } from './lib/api-client';
import { TaskCountsType } from './lib/db';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);
  const [blockedTasks, setBlockedTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [highlightedTasks, setHighlightedTasks] = useState<Task[]>([]);
  const [taskCounts, setTaskCounts] = useState<TaskCountsType>({ 'Pendiente': 0, 'En Progreso': 0, 'Bloqueada': 0, 'Terminada': 0 });
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState('task-manager');
  const [isScrolling, setIsScrolling] = useState(false);
  
  // Referencia al contenedor de pestañas
  const tabsSectionRef = useRef<HTMLDivElement>(null);
  
  // Cargar datos
  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar todos los datos
      const active = await taskApiClient.getActiveTasks();
      setActiveTasks(active);
      
      const pending = await taskApiClient.getPendingTasks();
      setPendingTasks(pending);
      
      const inProgress = await taskApiClient.getTasksInProgress();
      setInProgressTasks(inProgress);
      
      const blocked = await taskApiClient.getBlockedTasks();
      setBlockedTasks(blocked);
      
      const completed = await taskApiClient.getCompletedTasks();
      setCompletedTasks(completed);
      
      const all = await taskApiClient.getAllTasks();
      setAllTasks(all);
      
      const counts = await taskApiClient.getTaskCountByStatus();
      setTaskCounts(counts);
      
      // Cargar tareas destacadas
      const highlighted = await taskApiClient.getHighlightedTasks();
      setHighlightedTasks(highlighted);
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadData();
    
    // Configurar una actualización periódica cada 5 minutos
    const intervalId = setInterval(loadData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Datos para el gráfico de estado
  const statusData = [
    { name: 'Pendiente', value: taskCounts['Pendiente'] },
    { name: 'En Progreso', value: taskCounts['En Progreso'] },
    { name: 'Bloqueada', value: taskCounts['Bloqueada'] }
  ];
  
  // Obtener tareas próximas (ordenadas por fecha)
  const upcomingTasks = [...activeTasks]
    .filter(task => task.importantDate)
    .sort((a, b) => {
      if (!a.importantDate || !b.importantDate) return 0;
      return a.importantDate.localeCompare(b.importantDate);
    })
    .slice(0, 5);  // Mostrar solo las 5 primeras
  
  // Fecha de última actualización
  const lastUpdate = format(new Date(), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });

  // Navegar a una sección específica mediante hash
  const navigateToSection = (tabId: string) => {
    if (isScrolling) return;
    
    setIsScrolling(true);
    
    // Ajustar la URL con hash para navegación
    window.location.hash = tabId;
    
    // Destacar visualmente la sección de pestañas
    setTimeout(() => {
      const tabsSection = document.getElementById('tabs-section');
      if (tabsSection) {
        // Aplicar destacado visual
        tabsSection.classList.add('highlight-section');
        
        // Quitar el destacado después de un momento
        setTimeout(() => {
          tabsSection.classList.remove('highlight-section');
          setIsScrolling(false);
        }, 1000);
      } else {
        setIsScrolling(false);
      }
    }, 100);
  };
  
  // Contenido de las pestañas
  const tabsContent = [
    {
      id: 'task-manager',
      label: 'Gestión de Tareas',
      content: <TaskManager />
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
    <div className="bg-gradient-to-br from-blue-50 to-slate-100 rounded-lg p-6 shadow-sm">
      {/* Dashboard */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-info bg-clip-text text-transparent drop-shadow-sm">Estado de Tareas</h1>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">Última actualización: {lastUpdate}</p>
          <a href="/admin" className="text-sm text-blue-600 hover:underline">Administración</a>
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
      </div>
      
      {/* Sección de Gestión de Tareas */}
      <div className="border-t border-blue-100 pt-6" id="tabs-section" ref={tabsSectionRef}>
        <Tabs tabs={tabsContent} defaultTabId={activeTab} />
      </div>
      
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
  );
} 