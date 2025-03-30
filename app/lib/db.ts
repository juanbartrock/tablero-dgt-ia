import { Task } from './types';

// Tipo para conteos de tareas por estado
export type TaskCountsType = {
  'Pendiente': number;
  'En Progreso': number;
  'Bloqueada': number;
  'Terminada': number;
};

// Clave para almacenar tareas en localStorage
const TASKS_STORAGE_KEY = 'dashboard_tasks';
// Clave para almacenar la fecha de última actualización
const LAST_UPDATE_KEY = 'dashboard_last_update';

// Tareas de ejemplo para inicializar
const initialTasks: Task[] = [
  {
    id: 1,
    description: 'Desarrollo de API REST para módulo de facturación',
    status: 'En Progreso',
    responsible: 'María González',
    linkedAreas: ['Desarrollo', 'Finanzas'],
    importantDate: '2024-04-15',
    priority: 'Alta',
    highlighted: true,
    comment: 'Pendiente de revisión de diseño para la segunda fase del desarrollo'
  },
  {
    id: 2,
    description: 'Migración de base de datos a nuevo servidor',
    status: 'Pendiente',
    responsible: 'Juan Pérez',
    linkedAreas: ['Infraestructura', 'Desarrollo'],
    importantDate: '2024-04-20',
    priority: 'Alta',
    highlighted: true,
    comment: 'Se requiere coordinación con el equipo de infraestructura para definir ventana de mantenimiento'
  },
  {
    id: 3,
    description: 'Actualización de documentación técnica',
    status: 'Bloqueada',
    responsible: 'Carlos Rodríguez',
    linkedAreas: ['Documentación'],
    priority: 'Baja',
    comment: 'Bloqueado hasta que los desarrolladores terminen los cambios en el módulo de reportes'
  },
  {
    id: 4,
    description: 'Implementación de nuevos reportes gerenciales',
    status: 'Pendiente',
    responsible: 'Ana Martínez',
    linkedAreas: ['Reportes', 'Dirección'],
    importantDate: '2024-04-30',
    priority: 'Media',
    comment: 'Pendiente de aprobación por parte del comité directivo'
  },
  {
    id: 5,
    description: 'Optimización de consultas SQL en módulo de ventas',
    status: 'Terminada',
    responsible: 'Juan Pérez',
    linkedAreas: ['Desarrollo', 'Ventas'],
    priority: 'Media',
    comment: 'Se logró mejorar el rendimiento en un 60% según las métricas del último mes'
  }
];

// Inicializar la base de datos (localStorage)
export async function initializeDb(): Promise<void> {
  // En el cliente, verificamos si ya existen tareas en localStorage
  if (typeof window !== 'undefined') {
    if (!localStorage.getItem(TASKS_STORAGE_KEY)) {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(initialTasks));
      // También inicializamos la fecha de última actualización
      updateLastModifiedDate();
    } else {
      // Si existen tareas pero no fecha de actualización, inicializarla
      if (!localStorage.getItem(LAST_UPDATE_KEY)) {
        updateLastModifiedDate();
      }
    }
  }
}

// Función auxiliar para obtener tareas de localStorage
function getTasksFromStorage(): Task[] {
  if (typeof window === 'undefined') return [];
  
  const tasksJson = localStorage.getItem(TASKS_STORAGE_KEY);
  return tasksJson ? JSON.parse(tasksJson) : [];
}

// Función auxiliar para guardar tareas en localStorage
function saveTasksToStorage(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

// Obtener todas las tareas
export async function getAllTasks(): Promise<Task[]> {
  await initializeDb();
  return getTasksFromStorage();
}

// Obtener tareas por estado
export async function getTasksByStatus(status: string): Promise<Task[]> {
  const tasks = getTasksFromStorage();
  return tasks.filter(task => task.status === status);
}

// Actualizar la fecha de última actualización
function updateLastModifiedDate(): void {
  if (typeof window === 'undefined') return;
  
  const now = new Date().toISOString();
  localStorage.setItem(LAST_UPDATE_KEY, now);
}

// Obtener la fecha de última actualización
export async function getLastUpdateDate(): Promise<string> {
  if (typeof window === 'undefined') return '';
  
  const lastUpdate = localStorage.getItem(LAST_UPDATE_KEY);
  return lastUpdate || new Date().toISOString(); // Si no existe, devolver la fecha actual
}

// Crear una nueva tarea
export async function createTask(task: Omit<Task, 'id'>): Promise<Task> {
  // Obtener tareas existentes
  const tasks = getTasksFromStorage();
  
  console.log('Creando nueva tarea, datos recibidos:', task);
  
  // Generar ID único - Algoritmo mejorado
  let maxId = 0;
  
  // Verificar todas las tareas existentes
  if (tasks && tasks.length > 0) {
    console.log('Hay tareas existentes:', tasks.length);
    
    for (const t of tasks) {
      try {
        // Asegurarse de tener un valor numérico
        let idValue = 0;
        
        if (t && t.id !== undefined && t.id !== null) {
          if (typeof t.id === 'number') {
            idValue = t.id;
          } else if (typeof t.id === 'string' && t.id.trim() !== '') {
            const parsed = parseInt(t.id, 10);
            if (!isNaN(parsed)) {
              idValue = parsed;
            }
          }
          maxId = Math.max(maxId, idValue);
        }
      } catch (error) {
        console.error('Error al procesar ID de tarea existente:', error);
      }
    }
  } else {
    console.log('No hay tareas existentes, empezando desde ID 1');
  }
  
  // Asegurarse de que el ID sea siempre un número entero mayor que cero
  const newId = maxId + 1;
  console.log('Nuevo ID generado:', newId);
  
  // Crear la nueva tarea con todas las propiedades
  const newTask: Task = {
    id: newId,
    description: task.description || '',
    status: task.status || 'Pendiente',
    responsible: task.responsible || '',
    linkedAreas: Array.isArray(task.linkedAreas) ? task.linkedAreas : [],
    importantDate: task.importantDate || '',
    priority: task.priority || 'Media',
    highlighted: !!task.highlighted,
    comment: task.comment || ''
  };
  
  // Guardar la tarea
  console.log('Nueva tarea a guardar:', newTask);
  tasks.push(newTask);
  saveTasksToStorage(tasks);
  
  // Actualizar la fecha de última modificación
  updateLastModifiedDate();
  
  return newTask;
}

// Actualizar una tarea existente
export async function updateTask(task: Task): Promise<void> {
  // Obtener lista actualizada
  const tasks = getTasksFromStorage();
  
  // Convertir IDs a string para comparación consistente
  const taskIdStr = String(task.id);
  
  // Encontrar el índice de la tarea a actualizar
  const index = tasks.findIndex(t => String(t.id) === taskIdStr);
  
  console.log('Actualizando tarea con ID:', task.id, 'Encontrada en índice:', index);
  
  if (index !== -1) {
    // Crear un nuevo array con la tarea actualizada
    const updatedTasks = [...tasks];
    updatedTasks[index] = {
      ...task,  // Copiar todas las propiedades
      id: tasks[index].id  // Mantener el ID original
    };
    
    // Guardar la lista actualizada
    saveTasksToStorage(updatedTasks);
    // Actualizar la fecha de última modificación
    updateLastModifiedDate();
    console.log('Tarea actualizada. Total tareas:', updatedTasks.length);
  } else {
    console.error(`No se encontró la tarea con ID ${task.id} para actualizar`);
  }
}

// Eliminar una tarea
export async function deleteTask(id: number | string): Promise<void> {
  const tasks = getTasksFromStorage();
  
  // Simplificar el filtrado
  const filteredTasks = tasks.filter(task => {
    // Si ambos son del mismo tipo, comparación directa
    if (typeof task.id === typeof id) {
      return task.id !== id;
    }
    
    // Si son tipos diferentes, convertir a string para comparar
    return String(task.id) !== String(id);
  });
  
  if (filteredTasks.length !== tasks.length) {
    saveTasksToStorage(filteredTasks);
    // Actualizar la fecha de última modificación
    updateLastModifiedDate();
  }
}

// Obtener tareas activas (todas excepto 'Terminada')
export async function getActiveTasks(): Promise<Task[]> {
  const tasks = getTasksFromStorage();
  return tasks.filter(task => task.status !== 'Terminada');
}

// Obtener tareas completadas
export async function getCompletedTasks(): Promise<Task[]> {
  return getTasksByStatus('Terminada');
}

// Obtener tareas pendientes
export async function getPendingTasks(): Promise<Task[]> {
  return getTasksByStatus('Pendiente');
}

// Obtener tareas en progreso
export async function getTasksInProgress(): Promise<Task[]> {
  return getTasksByStatus('En Progreso');
}

// Obtener tareas bloqueadas
export async function getBlockedTasks(): Promise<Task[]> {
  return getTasksByStatus('Bloqueada');
}

// Obtener conteo de tareas por estado
export async function getTaskCountByStatus(): Promise<TaskCountsType> {
  const tasks = getTasksFromStorage();
  
  const result: TaskCountsType = {
    'Pendiente': 0,
    'En Progreso': 0,
    'Bloqueada': 0, 
    'Terminada': 0
  };
  
  tasks.forEach(task => {
    result[task.status] = (result[task.status] || 0) + 1;
  });
  
  return result;
}

// Obtener tareas destacadas
export async function getHighlightedTasks(): Promise<Task[]> {
  const tasks = getTasksFromStorage();
  return tasks.filter(task => task.highlighted === true);
}

// Eliminar todas las tareas
export async function deleteAllTasks(): Promise<void> {
  saveTasksToStorage([]);
  // Actualizar la fecha de última modificación
  updateLastModifiedDate();
} 