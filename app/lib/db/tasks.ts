import { db } from '.';
import { tasks } from './schema';
import { sql } from '@vercel/postgres';
import { eq, ne } from 'drizzle-orm';

// Tipos
export type Task = {
  id: number;
  description: string;
  status: string;
  responsible?: string | null;
  linkedAreas?: string[] | null;
  importantDate?: string | null;
  priority: string;
  highlighted: boolean | null;
  comment?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  fileUrl?: string | null;
  fileName?: string | null;
};

// Obtener todas las tareas
export async function getAllTasks(): Promise<Task[]> {
  try {
    return await db.select().from(tasks);
  } catch (error) {
    console.error('Error al obtener todas las tareas:', error);
    return [];
  }
}

// Obtener tareas por estado
export async function getTasksByStatus(status: string): Promise<Task[]> {
  try {
    return await db.select().from(tasks).where(eq(tasks.status, status));
  } catch (error) {
    console.error(`Error al obtener tareas con estado ${status}:`, error);
    return [];
  }
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

// Obtener tareas completadas
export async function getCompletedTasks(): Promise<Task[]> {
  return getTasksByStatus('Terminada');
}

// Obtener tareas activas (todas excepto las terminadas)
export async function getActiveTasks(): Promise<Task[]> {
  try {
    return await db.select().from(tasks).where(ne(tasks.status, 'Terminada'));
  } catch (error) {
    console.error('Error al obtener tareas activas:', error);
    return [];
  }
}

// Obtener conteo de tareas por estado
export async function getTaskCountByStatus(): Promise<Record<string, number>> {
  try {
    const counts = await sql`
      SELECT status, COUNT(*) as count
      FROM tasks
      GROUP BY status
    `;
    
    // Formatear resultados
    const result: Record<string, number> = {
      'Pendiente': 0,
      'En Progreso': 0,
      'Bloqueada': 0,
      'Terminada': 0
    };
    
    counts.rows.forEach((row: any) => {
      result[row.status] = parseInt(row.count);
    });
    
    return result;
  } catch (error) {
    console.error('Error al obtener conteo de tareas por estado:', error);
    return {
      'Pendiente': 0,
      'En Progreso': 0,
      'Bloqueada': 0,
      'Terminada': 0
    };
  }
}

// Crear una nueva tarea
export async function createTask(task: Omit<Task, 'id'>): Promise<Task> {
  try {
    const linkedAreasValue = task.linkedAreas || [];
    
    const result = await db.insert(tasks).values({
      description: task.description,
      status: task.status || 'Pendiente',
      responsible: task.responsible || '',
      linkedAreas: linkedAreasValue as any,
      importantDate: task.importantDate || '',
      priority: task.priority || 'Media',
      highlighted: !!task.highlighted,
      comment: task.comment || '',
      fileUrl: task.fileUrl || null,
      fileName: task.fileName || null
    }).returning();
    
    return result[0];
  } catch (error) {
    console.error('Error al crear tarea:', error);
    throw new Error('No se pudo crear la tarea');
  }
}

// Actualizar una tarea existente
export async function updateTask(task: Task): Promise<void> {
  try {
    await db.update(tasks)
      .set({
        description: task.description,
        status: task.status,
        responsible: task.responsible || '',
        linkedAreas: (task.linkedAreas || []) as any,
        importantDate: task.importantDate || '',
        priority: task.priority,
        highlighted: !!task.highlighted,
        comment: task.comment || '',
        fileUrl: task.fileUrl || null,
        fileName: task.fileName || null,
        updatedAt: new Date()
      })
      .where(eq(tasks.id, task.id));
  } catch (error) {
    console.error(`Error al actualizar tarea con ID ${task.id}:`, error);
    throw new Error('No se pudo actualizar la tarea');
  }
}

// Eliminar una tarea
export async function deleteTask(id: number): Promise<void> {
  try {
    await db.delete(tasks).where(eq(tasks.id, id));
  } catch (error) {
    console.error(`Error al eliminar tarea con ID ${id}:`, error);
    throw new Error('No se pudo eliminar la tarea');
  }
} 