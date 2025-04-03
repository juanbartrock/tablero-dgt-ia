export type TaskStatus = 'Pendiente' | 'En Progreso' | 'Bloqueada' | 'Terminada';
export type TaskPriority = 'Alta' | 'Media' | 'Baja';

export interface Task {
  id: string | number;      // Identificador único de la tarea
  description: string;      // Descripción breve y representativa
  status: TaskStatus;       // Estado actual de la tarea
  responsible: string;      // Nombre del responsable principal
  linkedAreas: string[];    // Áreas o equipos relacionados/afectados
  importantDate?: string;   // Fecha relevante (lanzamiento, hito, Vencimiento) - Formato 'YYYY-MM-DD'
  priority: TaskPriority;   // Nivel de prioridad
  highlighted?: boolean;    // Indica si la tarea está destacada
  comment?: string;         // Comentario o notas adicionales sobre la tarea
  fileUrl?: string;         // URL del archivo adjunto en Supabase Storage
  fileName?: string;        // Nombre original del archivo
} 