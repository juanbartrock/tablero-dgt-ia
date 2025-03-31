'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '@/app/lib/types';
import TasksTable from './TasksTable';
import TaskForm from './TaskForm';
// import { taskApiClient } from '@/app/lib/api-client'; // Ya no se usa
import { useAuth } from '@/app/lib/auth/auth-context';

// Definir las props que el componente recibirá
interface TaskManagerProps {
  initialTasks: Task[];
  onTasksUpdated: () => void;
}

export default function TaskManager({ initialTasks, onTasksUpdated }: TaskManagerProps) {
  const { user } = useAuth();
  console.log('TaskManager - Received initialTasks:', initialTasks); // Log al recibir props
  // Inicializar el estado con las props
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(initialTasks);
  // const [loading, setLoading] = useState(true); // Ya no es necesario el loading general inicial
  const [actionLoading, setActionLoading] = useState(false); // Loading para acciones específicas (delete, save, import)
  const [showForm, setShowForm] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false); // Se puede mantener para el botón de importar
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('description');

  // Verificar si el usuario actual es admin
  const isAdmin = user?.username === 'admin';

  // Efecto para actualizar el estado interno si las props iniciales cambian
  useEffect(() => {
    console.log('TaskManager - useEffect updating tasks from initialTasks:', initialTasks); // Log en useEffect
    setTasks(initialTasks);
    filterTasks(searchTerm, searchField, initialTasks);
  }, [initialTasks]);

  // Función de filtrado reutilizable
  const filterTasks = (term: string, field: string, currentTasks: Task[]) => {
      if (term.trim() === '') {
          setFilteredTasks(currentTasks);
          return;
      }
      const searchTermLower = term.toLowerCase();
      const filtered = currentTasks.filter(task => {
        switch(field) {
            case 'description':
              return task.description.toLowerCase().includes(searchTermLower);
            case 'responsible':
              return task.responsible.toLowerCase().includes(searchTermLower);
            case 'status':
              return task.status.toLowerCase().includes(searchTermLower);
            case 'priority':
              return task.priority.toLowerCase().includes(searchTermLower);
            case 'comment':
              return task.comment?.toLowerCase().includes(searchTermLower);
            case 'all':
              return (
                task.description.toLowerCase().includes(searchTermLower) ||
                task.responsible.toLowerCase().includes(searchTermLower) ||
                task.status.toLowerCase().includes(searchTermLower) ||
                task.priority.toLowerCase().includes(searchTermLower) ||
                (task.comment && task.comment.toLowerCase().includes(searchTermLower))
              );
            default:
              return true;
          }
      });
      console.log('TaskManager - Setting filteredTasks:', filtered); // Log después de filtrar
      setFilteredTasks(filtered);
  };

  // Filtrar tareas cuando cambia el término de búsqueda o el campo
  useEffect(() => {
    filterTasks(searchTerm, searchField, tasks);
  }, [searchTerm, searchField, tasks]);

  // Manejar la edición de una tarea
  const handleEdit = (task: Task) => {
    setCurrentTask(task);
    setShowForm(true);
  };

  // Manejar la eliminación de una tarea
  const handleDelete = async (taskId: string | number) => {
    if (window.confirm('¿Está seguro que desea eliminar esta tarea?')) {
      setError(null);
      setActionLoading(true);
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'DELETE',
        });
        const data = await response.json(); // Leer respuesta para mensaje

        if (!response.ok) {
          throw new Error(data.message || 'Error al eliminar la tarea');
        }
        
        // console.log(data.message); // Mensaje de éxito
        onTasksUpdated(); // Llamar al callback para que el padre recargue
        // Ya no actualizamos el estado local: setTasks(tasks.filter(task => task.id !== taskId));

      } catch (err: any) {
        console.error('Error al eliminar la tarea:', err);
        setError(err.message || 'Error al eliminar la tarea. Por favor, intente nuevamente.');
      } finally {
         setActionLoading(false);
      }
    }
  };

  // Manejar el guardado de una tarea
  const handleSaveTask = async (taskData: Omit<Task, 'id'> | Task) => {
    setError(null);
    setActionLoading(true);
    let url = '/api/tasks';
    let method = 'POST';

    try {
      console.log('Datos de tarea recibidos para guardar:', taskData);
      
      if ('id' in taskData && taskData.id) {
        // Actualizar tarea existente
        console.log('Actualizando tarea existente con ID:', taskData.id);
        url = `/api/tasks/${taskData.id}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (method === 'POST' ? 'Error al crear la tarea' : 'Error al actualizar la tarea'));
      }
      
      // Cerrar el formulario y resetear la tarea actual
      setShowForm(false);
      setCurrentTask(undefined);
      onTasksUpdated(); // Llamar al callback para recargar
      // Ya no actualizamos estado local aquí

    } catch (err: any) {
      console.error('Error al guardar la tarea:', err);
      setError(err.message || 'Error al guardar la tarea. Por favor, intente nuevamente.');
    } finally {
        setActionLoading(false);
    }
  };

  // Cancelar la edición/creación de una tarea
  const handleCancel = () => {
    setShowForm(false);
    setCurrentTask(undefined);
  };

  // Importar tareas desde Google Sheets
  const handleImportTasks = async () => {
    // ... (Esta lógica necesita una API /api/tasks/import-google-sheets si debe funcionar)
    // Por ahora, la dejamos como estaba pero marcamos que necesita refactor
    console.warn("TODO: handleImportTasks necesita usar fetch a una API dedicada.");
    // Simulación temporal (no hace nada útil)
    setImporting(true);
    setError('Funcionalidad de importación no implementada con API.');
    setTimeout(() => { setImporting(false); }, 1000);
  };

  // Manejar la eliminación de todas las tareas
  const handleDeleteAllTasks = async () => {
     // ... (Esta lógica necesita una API /api/tasks/delete-all si debe funcionar)
     console.warn("TODO: handleDeleteAllTasks necesita usar fetch a una API dedicada.");
     setError('Funcionalidad de eliminar todo no implementada con API.');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-start mb-6">
        {/* Botones Nueva Tarea / Importar / Eliminar Todo */}
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setCurrentTask(undefined);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 disabled:opacity-50"
            disabled={actionLoading || showForm}
          >
            Nueva Tarea
          </button>
          {isAdmin && (
            <>
              <button
                onClick={handleImportTasks}
                disabled={importing || actionLoading || showForm}
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
              >
                {importing ? 'Importando...' : 'Importar G.Sheets'} 
              </button>
              {/* Eliminamos el botón de borrar todo por ahora hasta tener la API 
              <button
                onClick={handleDeleteAllTasks}
                disabled={actionLoading || showForm || tasks.length === 0}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                Eliminar Todo
              </button> */}
            </>
          )}
        </div>
        {/* Barra de Búsqueda */}
        <div className="flex items-center space-x-2">
             <select 
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
             >
                <option value="description">Descripción</option>
                <option value="responsible">Responsable</option>
                <option value="status">Estado</option>
                <option value="priority">Prioridad</option>
                <option value="comment">Comentario</option>
                <option value="all">Todo</option>
            </select>
            <input 
                type="text"
                placeholder={`Buscar en ${searchField}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Formulario o Tabla */} 
      {showForm ? (
        <TaskForm 
          task={currentTask} 
          onSubmit={handleSaveTask} 
          onCancel={handleCancel} 
          isLoading={actionLoading} // Pasar estado de carga para el form
        />
      ) : (
        <TasksTable 
          tasks={filteredTasks} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
          isLoading={actionLoading} // Indicar si alguna acción está en curso
        />
      )}
    </div>
  );
} 