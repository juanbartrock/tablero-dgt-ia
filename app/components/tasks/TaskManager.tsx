'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '@/app/lib/types';
import TasksTable from './TasksTable';
import TaskForm from './TaskForm';
import { taskApiClient } from '@/app/lib/api-client';

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('description');

  // Cargar las tareas
  const loadTasks = async () => {
    try {
      setLoading(true);
      const tasksData = await taskApiClient.getAllTasks();
      setTasks(tasksData);
      setFilteredTasks(tasksData);
      setError(null);
    } catch (err) {
      console.error('Error al cargar las tareas:', err);
      setError('Error al cargar las tareas. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Filtrar tareas cuando cambia el término de búsqueda o el campo de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTasks(tasks);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = tasks.filter(task => {
      switch(searchField) {
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
    setFilteredTasks(filtered);
  }, [searchTerm, searchField, tasks]);

  // Manejar la edición de una tarea
  const handleEdit = (task: Task) => {
    setCurrentTask(task);
    setShowForm(true);
  };

  // Manejar la eliminación de una tarea
  const handleDelete = async (taskId: string | number) => {
    if (window.confirm('¿Está seguro que desea eliminar esta tarea?')) {
      try {
        await taskApiClient.deleteTask(taskId);
        // Actualizar la lista de tareas
        setTasks(tasks.filter(task => task.id !== taskId));
        setError(null);
      } catch (err) {
        console.error('Error al eliminar la tarea:', err);
        setError('Error al eliminar la tarea. Por favor, intente nuevamente.');
      }
    }
  };

  // Manejar el guardado de una tarea (crear o actualizar)
  const handleSaveTask = async (taskData: Omit<Task, 'id'> | Task) => {
    try {
      console.log('Datos de tarea recibidos para guardar:', taskData);
      
      if ('id' in taskData && taskData.id) {
        // Actualizar tarea existente
        console.log('Actualizando tarea existente con ID:', taskData.id);
        await taskApiClient.updateTask(taskData as Task);
        
        // Actualizar la lista de tareas local
        setTasks(prevTasks => 
          prevTasks.map(task => 
            String(task.id) === String(taskData.id) ? taskData as Task : task
          )
        );
      } else {
        // Crear nueva tarea - asegurarse de que no tenga un ID
        console.log('Creando nueva tarea');
        const taskToCreate: Omit<Task, 'id'> = {
          description: taskData.description,
          status: taskData.status,
          responsible: taskData.responsible,
          linkedAreas: taskData.linkedAreas,
          importantDate: taskData.importantDate,
          priority: taskData.priority,
          highlighted: taskData.highlighted,
          comment: taskData.comment
        };
        
        // Llamar API para crear tarea
        const newTask = await taskApiClient.createTask(taskToCreate);
        console.log('Tarea creada con ID:', newTask.id);
        
        // Agregar la nueva tarea a la lista local
        setTasks(prevTasks => [...prevTasks, newTask]);
      }
      
      // Cerrar el formulario y resetear la tarea actual
      setShowForm(false);
      setCurrentTask(undefined);
      setError(null);
    } catch (err) {
      console.error('Error al guardar la tarea:', err);
      setError('Error al guardar la tarea. Por favor, intente nuevamente.');
    }
  };

  // Cancelar la edición/creación de una tarea
  const handleCancel = () => {
    setShowForm(false);
    setCurrentTask(undefined);
  };

  // Importar tareas desde Google Sheets
  const handleImportTasks = async () => {
    if (window.confirm('¿Está seguro que desea importar tareas desde Google Sheets? Esto agregará nuevas tareas a las existentes.')) {
      try {
        setImporting(true);
        setError(null);
        
        // Importar tareas desde Google Sheets
        const importedTasks = await taskApiClient.importTasksFromGoogleSheets();
        
        if (!importedTasks || importedTasks.length === 0) {
          alert('No se encontraron tareas para importar o hubo un problema con la hoja de cálculo.');
        } else {
          // Actualizar la lista de tareas
          setTasks(prevTasks => [...prevTasks, ...importedTasks]);
          alert(`Se importaron ${importedTasks.length} tareas correctamente.`);
        }
      } catch (err) {
        console.error('Error al importar tareas:', err);
        setError('Error al importar tareas desde Google Sheets. Por favor, intente nuevamente.');
      } finally {
        setImporting(false);
      }
    }
  };

  // Manejar la eliminación de todas las tareas
  const handleDeleteAllTasks = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar TODAS las tareas? Esta acción no se puede deshacer.')) {
      try {
        setLoading(true);
        await taskApiClient.deleteAllTasks();
        // Actualizar la lista de tareas
        setTasks([]);
        setError(null);
      } catch (err) {
        console.error('Error al eliminar todas las tareas:', err);
        setError('Error al eliminar todas las tareas. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between mb-6">
        <div>
          <button
            onClick={() => {
              setCurrentTask(undefined);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600"
          >
            Nueva Tarea
          </button>
        </div>
        <div className="flex">
          <button
            onClick={handleImportTasks}
            disabled={importing || loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 disabled:bg-blue-300 mr-2"
          >
            {importing ? 'Importando...' : 'Importar desde Google Sheets'}
          </button>
          <button
            onClick={handleDeleteAllTasks}
            disabled={loading || tasks.length === 0}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            {loading ? 'Procesando...' : 'Eliminar todas las tareas'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center p-8">
          <p className="text-gray-500">Cargando tareas...</p>
        </div>
      ) : (
        <>
          {showForm ? (
            <TaskForm 
              task={currentTask} 
              onSubmit={handleSaveTask} 
              onCancel={handleCancel} 
            />
          ) : (
            <>
              {/* Sección de Búsqueda */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <h3 className="text-lg font-medium mb-4 text-gray-700">Búsqueda de Tareas</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-grow md:flex-grow-0 min-w-[250px]">
                    <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">
                      Término de búsqueda
                    </label>
                    <input
                      type="text"
                      id="searchTerm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar tareas..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="w-full md:w-auto">
                    <label htmlFor="searchField" className="block text-sm font-medium text-gray-700 mb-1">
                      Buscar en campo
                    </label>
                    <select
                      id="searchField"
                      value={searchField}
                      onChange={(e) => setSearchField(e.target.value)}
                      className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="all">Todos los campos</option>
                      <option value="description">Descripción</option>
                      <option value="responsible">Responsable</option>
                      <option value="status">Estado</option>
                      <option value="priority">Prioridad</option>
                      <option value="comment">Comentario</option>
                    </select>
                  </div>
                  {searchTerm && (
                    <div className="flex-shrink-0 self-end md:self-center mt-2 md:mt-0">
                      <button
                        onClick={() => setSearchTerm('')}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
                      >
                        Limpiar
                      </button>
                    </div>
                  )}
                </div>
                {searchTerm && (
                  <div className="mt-2 text-sm text-gray-600">
                    Mostrando {filteredTasks.length} de {tasks.length} tareas
                  </div>
                )}
              </div>
            
              <TasksTable 
                tasks={filteredTasks} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
              />
            </>
          )}
        </>
      )}
    </div>
  );
} 