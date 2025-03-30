import { Task } from './types';
import { 
  getAllTasks,
  getTasksByStatus,
  createTask,
  updateTask,
  deleteTask,
  getActiveTasks,
  getTasksInProgress,
  getBlockedTasks,
  getCompletedTasks,
  getPendingTasks,
  getTaskCountByStatus,
  getHighlightedTasks,
  deleteAllTasks,
  TaskCountsType
} from './db';
import { importTasksFromGoogleSheets } from './google-sheets-client';

// Clase para manejar las operaciones de tareas
export class TaskApiClient {
  // Obtener todas las tareas
  async getAllTasks(): Promise<Task[]> {
    return getAllTasks();
  }
  
  // Obtener tareas por estado
  async getTasksByStatus(status: string): Promise<Task[]> {
    return getTasksByStatus(status);
  }
  
  // Crear una nueva tarea
  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    return createTask(task);
  }
  
  // Actualizar una tarea existente
  async updateTask(task: Task): Promise<void> {
    return updateTask(task);
  }
  
  // Eliminar una tarea
  async deleteTask(id: string | number): Promise<void> {
    return deleteTask(id);
  }
  
  // Obtener tareas activas (todas excepto las terminadas)
  async getActiveTasks(): Promise<Task[]> {
    return getActiveTasks();
  }
  
  // Obtener tareas pendientes
  async getPendingTasks(): Promise<Task[]> {
    return getPendingTasks();
  }
  
  // Obtener tareas en progreso
  async getTasksInProgress(): Promise<Task[]> {
    return getTasksInProgress();
  }
  
  // Obtener tareas bloqueadas
  async getBlockedTasks(): Promise<Task[]> {
    return getBlockedTasks();
  }
  
  // Obtener tareas completadas
  async getCompletedTasks(): Promise<Task[]> {
    return getCompletedTasks();
  }
  
  // Obtener el recuento de tareas por estado
  async getTaskCountByStatus(): Promise<TaskCountsType> {
    return getTaskCountByStatus();
  }
  
  // Obtener tareas destacadas
  async getHighlightedTasks(): Promise<Task[]> {
    return getHighlightedTasks();
  }

  // Eliminar todas las tareas
  async deleteAllTasks(): Promise<void> {
    return deleteAllTasks();
  }

  // Importar tareas desde Google Sheets
  async importTasksFromGoogleSheets(): Promise<Task[]> {
    try {
      // Obtener las tareas de la hoja de cálculo
      const tasksFromSheets = await importTasksFromGoogleSheets();
      
      // Crear cada tarea en la base de datos
      const createdTasks: Task[] = [];
      
      for (const task of tasksFromSheets) {
        const newTask = await this.createTask(task);
        createdTasks.push(newTask);
      }
      
      return createdTasks;
    } catch (error) {
      console.error("Error al importar tareas desde Google Sheets:", error);
      throw error;
    }
  }
}

// Exportar una instancia del cliente de API
export const taskApiClient = new TaskApiClient(); 