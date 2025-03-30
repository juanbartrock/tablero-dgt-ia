// Este archivo solo mantiene compatibilidad con código existente
// Las nuevas implementaciones deben usar directamente db.ts

import { 
  getAllTasks, 
  getActiveTasks, 
  getBlockedTasks, 
  getCompletedTasks, 
  getPendingTasks, 
  getTasksInProgress, 
  getTaskCountByStatus 
} from './db';
import { Task } from './types';

// Datos de ejemplo para compatibilidad con código antiguo
// Estos datos no se utilizan más, solo para mantener compatibilidad
export const tasksData: Task[] = [];

// Funciones de compatibilidad para código existente
// Estas funciones llaman a las implementaciones reales en db.ts

// Obtener tareas próximas
export async function getUpcomingTasks(daysAhead: number = 7): Promise<Task[]> {
  const activeTasks = await getActiveTasks();
  
  // Separar tareas con y sin fecha
  const tasksWithDate = activeTasks.filter(task => task.importantDate);
  const tasksWithoutDate = activeTasks.filter(task => !task.importantDate);
  
  // Ordenar tareas con fecha, de más reciente a más antigua
  const sortedTasksWithDate = tasksWithDate.sort((a, b) => {
    if (!a.importantDate || !b.importantDate) return 0;
    // Orden inverso para que las fechas más recientes estén primero
    return b.importantDate.localeCompare(a.importantDate);
  });
  
  // Combinar tareas con fecha ordenadas y tareas sin fecha
  return [...sortedTasksWithDate, ...tasksWithoutDate];
}

// Re-exportar funciones del módulo db.ts para compatibilidad
export { 
  getAllTasks, 
  getActiveTasks, 
  getBlockedTasks, 
  getCompletedTasks, 
  getPendingTasks, 
  getTasksInProgress, 
  getTaskCountByStatus 
}; 