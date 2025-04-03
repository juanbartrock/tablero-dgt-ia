import { Task } from './types';
import { query } from './postgres'; // Importar la función query

// Tipo para conteos de tareas por estado
export type TaskCountsType = {
  'Pendiente': number;
  'En Progreso': number;
  'Bloqueada': number;
  'Terminada': number;
};

// Función auxiliar para mapear fila de DB a objeto Task
function mapRowToTask(row: any): Task {
  return {
    id: row.id, // ID siempre será number desde la DB
    description: row.description,
    status: row.status,
    responsible: row.responsible,
    linkedAreas: Array.isArray(row.linked_areas) ? row.linked_areas : [], // Mapear linked_areas de DB a linkedAreas
    // Mapear important_date de DB a importantDate (asegurando formato)
    importantDate: row.important_date ? new Date(row.important_date).toISOString().split('T')[0] : undefined,
    priority: row.priority,
    highlighted: row.highlighted,
    comment: row.comment,
    fileUrl: row.file_url,
    fileName: row.file_name
  };
}

// Obtener todas las tareas
export async function getAllTasks(): Promise<Task[]> {
  try {
    console.log('getAllTasks - Calling query...'); // Log antes de query
    const result = await query('SELECT * FROM tasks ORDER BY created_at DESC');
    console.log('getAllTasks - Query returned result.rows:', result.rows); // Log de result.rows CRUDO
    console.log('getAllTasks - Query returned result.rowCount:', result.rowCount); // Log de result.rowCount aquí también
    // Mapear cada fila al tipo Task
    const mappedTasks = result.rows.map(mapRowToTask);
    console.log('getAllTasks - Mapped tasks:', mappedTasks); // Log después de mapear
    return mappedTasks;
  } catch (error) {
    console.error('Error fetching all tasks:', error);
    throw error; // O devolver [] según la política de errores
  }
}

// Obtener tareas por estado
export async function getTasksByStatus(status: string): Promise<Task[]> {
  try {
    const result = await query('SELECT * FROM tasks WHERE status = $1 ORDER BY created_at DESC', [status]);
    return result.rows.map(mapRowToTask);
  } catch (error) {
    console.error(`Error fetching tasks by status (${status}):`, error);
    throw error;
  }
}

// Obtener la fecha de última actualización (basado en la tarea modificada más recientemente)
export async function getLastUpdateDate(): Promise<string> {
  try {
    // Obtener el valor máximo de updated_at de la tabla tasks
    const result = await query('SELECT MAX(updated_at) as last_update FROM tasks');
    if (result.rows.length > 0 && result.rows[0].last_update) {
      return new Date(result.rows[0].last_update).toISOString();
    }
    // Si no hay tareas o ninguna tiene fecha, devolver la fecha actual o un valor por defecto
    return new Date().toISOString(); 
  } catch (error) {
    console.error('Error fetching last update date:', error);
    // Devolver fecha actual como fallback en caso de error
    return new Date().toISOString();
  }
}

// Crear una nueva tarea
export async function createTask(taskData: Omit<Task, 'id'>): Promise<Task> {
  // Usar nombres camelCase del tipo Task aquí
  const { 
      description, 
      status = 'Pendiente', 
      responsible, 
      linkedAreas = [], // Usar camelCase
      importantDate,    // Usar camelCase
      priority = 'Media', 
      highlighted = false, 
      comment,
      fileUrl,
      fileName
  } = taskData;

  console.log('🔍 db.ts - createTask: Creando tarea con datos:', {
    description, status, responsible, linkedAreas, 
    importantDate, priority, highlighted, comment,
    fileUrl, fileName
  });

  // Convertir a snake_case para la DB y asegurar null para fecha inválida
  const dbImportantDate = importantDate && !isNaN(new Date(importantDate).getTime()) 
                          ? new Date(importantDate).toISOString().split('T')[0] 
                          : null;

  try {
    const result = await query(
      // Usar nombres snake_case de las columnas de la DB aquí
      `INSERT INTO tasks (description, status, responsible, linked_areas, important_date, priority, highlighted, comment, file_url, file_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`, 
      // Pasar los valores correspondientes (linkedAreas necesita ir como array)
      [description, status, responsible, linkedAreas, dbImportantDate, priority, highlighted, comment, fileUrl, fileName]
    );
    
    if (result.rows.length > 0) {
      // Mapear la fila devuelta al tipo Task
      console.log('✅ db.ts - createTask: Tarea creada exitosamente, row devuelta:', result.rows[0]);
      const newTask = mapRowToTask(result.rows[0]);
      console.log('✅ db.ts - createTask: Tarea mapeada:', newTask);
      return newTask;
    }
    
    throw new Error('Task creation failed, no row returned.');
  } catch (error) {
    console.error('❌ db.ts - Error al crear tarea:', error);
    throw error;
  }
}

// Actualizar una tarea existente
export async function updateTask(task: Task): Promise<Task | null> {
   // Usar nombres camelCase del tipo Task aquí
  const { 
      id, // ID puede ser string o number según el tipo Task, pero la DB espera number
      description, 
      status, 
      responsible, 
      linkedAreas,    // Usar camelCase
      importantDate,   // Usar camelCase
      priority, 
      highlighted, 
      comment 
  } = task;

  // Validar y convertir ID a número
  const taskId = typeof id === 'string' ? parseInt(id, 10) : id;
  if (typeof taskId !== 'number' || isNaN(taskId)) {
      console.error('Invalid task ID for update:', id);
      throw new Error('Invalid task ID for update.');
  }
  
   // Convertir a snake_case para la DB y asegurar null para fecha inválida
  const dbImportantDate = importantDate && !isNaN(new Date(importantDate).getTime()) 
                          ? new Date(importantDate).toISOString().split('T')[0] 
                          : null;

  try {
    const result = await query(
      // Usar nombres snake_case de las columnas de la DB aquí
      `UPDATE tasks 
       SET description = $1, status = $2, responsible = $3, linked_areas = $4, 
           important_date = $5, priority = $6, highlighted = $7, comment = $8
       WHERE id = $9
       RETURNING *`, 
       // Pasar los valores correspondientes (linkedAreas necesita ir como array, id como número)
      [description, status, responsible, linkedAreas, dbImportantDate, priority, highlighted, comment, taskId]
    );

    if (result.rows.length > 0) {
      // Mapear la fila devuelta al tipo Task
      return mapRowToTask(result.rows[0]);
    } else {
      // Si no se actualizó ninguna fila, la tarea no existía
      console.warn(`Task with ID ${id} not found for update.`);
      return null; 
    }
  } catch (error) {
    console.error(`Error updating task with ID ${id}:`, error);
    throw error;
  }
}

// Eliminar una tarea
export async function deleteTask(id: number | string): Promise<boolean> {
  const taskId = typeof id === 'string' ? parseInt(id, 10) : id;

  if (isNaN(taskId)) {
    console.error('Invalid task ID for deletion:', id);
    return false;
  }

  try {
    const result = await query('DELETE FROM tasks WHERE id = $1', [taskId]);
    // Verificar rowCount contra null y 0
    return result.rowCount !== null && result.rowCount > 0; 
  } catch (error) {
    console.error(`Error deleting task with ID ${taskId}:`, error);
    throw error; // O devolver false
  }
}

// Obtener tareas activas (todas excepto 'Terminada')
export async function getActiveTasks(): Promise<Task[]> {
   try {
    const result = await query("SELECT * FROM tasks WHERE status <> 'Terminada' ORDER BY created_at DESC");
    return result.rows.map(mapRowToTask);
  } catch (error) {
    console.error('Error fetching active tasks:', error);
    throw error;
  }
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
export async function getTaskCounts(): Promise<TaskCountsType> {
  try {
    const result = await query(
        `SELECT status, COUNT(*) as count 
         FROM tasks 
         GROUP BY status`
    );
    
    const counts: TaskCountsType = {
        'Pendiente': 0,
        'En Progreso': 0,
        'Bloqueada': 0,
        'Terminada': 0
    };
    
    result.rows.forEach(row => {
      if (counts.hasOwnProperty(row.status)) {
          counts[row.status as keyof TaskCountsType] = parseInt(row.count, 10);
      }
    });
    
    return counts;
  } catch (error) {
    console.error('Error fetching task counts:', error);
    throw error;
  }
}

// Obtener tareas destacadas
export async function getHighlightedTasks(): Promise<Task[]> {
  try {
    console.log('🔍 db.ts - getHighlightedTasks: Consultando tareas destacadas');
    // Seleccionar solo las tareas donde highlighted = true
    const result = await query("SELECT * FROM tasks WHERE highlighted = TRUE ORDER BY created_at DESC");
    console.log(`🔍 db.ts - getHighlightedTasks: Se encontraron ${result.rows.length} tareas destacadas`);
    
    // Log adicional para mostrar las filas encontradas
    if (result.rows.length > 0) {
      console.log('🔍 db.ts - Primera fila de datos de tarea destacada:', result.rows[0]);
    } else {
      console.log('🔍 db.ts - No se encontraron tareas destacadas');
    }
    
    const tasks = result.rows.map(mapRowToTask);
    return tasks;
  } catch (error) {
    console.error('❌ db.ts - Error al obtener tareas destacadas:', error);
    throw error; // Propagar el error para manejarlo en la capa de API
  }
}

// Eliminar todas las tareas
export async function deleteAllTasks(): Promise<void> {
  await deleteTask('all');
}

// Obtener tareas por responsable
export async function getTasksByResponsible(responsible: string): Promise<Task[]> {
  try {
    const result = await query('SELECT * FROM tasks WHERE responsible = $1 ORDER BY created_at DESC', [responsible]);
    return result.rows.map(mapRowToTask);
  } catch (error) {
    console.error(`Error fetching tasks for responsible (${responsible}):`, error);
    throw error;
  }
}

// Función para insertar las tareas iniciales si la tabla está vacía (opcional, para desarrollo)
export async function seedInitialTasksIfEmpty(): Promise<void> {
  try {
    const countResult = await query('SELECT COUNT(*) as count FROM tasks');
    const taskCount = parseInt(countResult.rows[0].count, 10);

    if (taskCount === 0) {
      console.log('Seeding initial tasks into empty database...');
      const initialTasksData = [
          // Pegar aquí los datos de initialTasks que tenías antes si quieres
          // Ejemplo:
          { description: 'Configurar proyecto Next.js', status: 'Terminada', responsible: 'Admin', linkedAreas: ['Desarrollo'], importantDate: '2024-01-10', priority: 'Alta' },
          { description: 'Diseñar esquema de base de datos', status: 'Terminada', responsible: 'Admin', linkedAreas: ['Desarrollo', 'DBA'], importantDate: '2024-01-15', priority: 'Alta' },
          { description: 'Refactorizar API de autenticación', status: 'En Progreso', responsible: 'Admin', linkedAreas: ['Desarrollo', 'Seguridad'], importantDate: '2024-04-10', priority: 'Media', highlighted: true },
      ];

      // Usar Promise.all para insertar todas las tareas iniciales
      await Promise.all(initialTasksData.map(task => createTask(task as any))); 
      // Usamos 'as any' porque createTask espera Omit<...> pero aquí tenemos más campos
      
      console.log('Initial tasks seeded successfully.');
    } else {
      console.log('Tasks table is not empty, skipping seeding.');
    }
  } catch (error) {
    console.error('Error seeding initial tasks:', error);
    // No relanzar el error para no bloquear el inicio de la app si el seeding falla
  }
} 