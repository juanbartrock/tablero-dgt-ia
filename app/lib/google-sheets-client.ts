import { Task, TaskStatus, TaskPriority } from './types';

// ID de la hoja de cálculo
const SPREADSHEET_ID = '12x--19fQ2nfE-w5m4Btk1hOpsL9Q9wNucRmvHhgYOk0';

// Función para validar el estado de una tarea
function validateTaskStatus(status: string): TaskStatus {
  const validStatuses: TaskStatus[] = ['Pendiente', 'En Progreso', 'Bloqueada', 'Terminada'];
  const normalizedStatus = status.trim();
  
  // Primero intentamos con coincidencia exacta (ignorando mayúsculas/minúsculas)
  for (const validStatus of validStatuses) {
    if (normalizedStatus.toLowerCase() === validStatus.toLowerCase()) {
      return validStatus;
    }
  }
  
  // Si no coincide exactamente, verificamos estados alternativos
  const statusMap: Record<string, TaskStatus> = {
    'finalizado': 'Terminada',
    'finalizad': 'Terminada',
    'fin': 'Terminada',
    'terminado': 'Terminada',
    'completo': 'Terminada',
    'completado': 'Terminada',
    'investigación': 'En Progreso',
    'investigacion': 'En Progreso',
    'en laboratorio': 'En Progreso',
    'laboratorio': 'En Progreso',
    'lab': 'En Progreso',
    'en proceso': 'En Progreso',
    'proceso': 'En Progreso',
    'en revisión': 'En Progreso',
    'en revision': 'En Progreso',
    'revisión': 'En Progreso',
    'revision': 'En Progreso',
    'en implementación': 'En Progreso',
    'en implementacion': 'En Progreso',
    'implementación': 'En Progreso',
    'implementacion': 'En Progreso',
    'bloqueado': 'Bloqueada',
    'detenido': 'Bloqueada',
    'paralizado': 'Bloqueada',
    'en espera': 'Bloqueada',
    'espera': 'Bloqueada',
    'pendiente aprobación': 'Pendiente',
    'pendiente aprobacion': 'Pendiente',
    'por iniciar': 'Pendiente',
    'no iniciado': 'Pendiente',
    'planificado': 'Pendiente'
  };
  
  // Verificar si el estado normalizado coincide con alguna de las alternativas
  const lowerStatus = normalizedStatus.toLowerCase();
  
  for (const [key, value] of Object.entries(statusMap)) {
    if (lowerStatus.includes(key)) {
      return value;
    }
  }
  
  // Si no coincide con ninguna, usamos Pendiente como valor predeterminado
  return 'Pendiente';
}

// Función para validar la prioridad de una tarea
function validateTaskPriority(priority: string): TaskPriority {
  const validPriorities: TaskPriority[] = ['Alta', 'Media', 'Baja'];
  const normalizedPriority = priority.trim();
  
  for (const validPriority of validPriorities) {
    if (normalizedPriority.toLowerCase() === validPriority.toLowerCase()) {
      return validPriority;
    }
  }
  
  return 'Media'; // Valor por defecto
}

// Procesar múltiples responsables desde un string separado por comas
function processResponsibles(responsibleStr: string): string {
  if (!responsibleStr || responsibleStr.trim() === '') {
    return '';
  }
  
  // Limpiamos y formateamos el string de responsables
  return responsibleStr.trim();
}

// Función para transformar una fila de la hoja de cálculo en un objeto Task
function mapRowToTask(row: any[], headers: string[]): Omit<Task, 'id'> {
  // Crear un objeto con las propiedades de la fila
  const rowData: Record<string, any> = {};
  
  headers.forEach((header, index) => {
    if (index < row.length) {
      rowData[header] = row[index];
    }
  });
  
  // Log para ayudar a depurar
  console.log('Headers de la hoja:', headers);
  console.log('Datos de fila raw:', row);
  console.log('Datos de fila procesados:', rowData);
  
  // Extraer y validar los campos
  const description = rowData['description'] || rowData['Descripción'] || rowData['descripcion'] || '';
  const status = validateTaskStatus(rowData['status'] || rowData['Estado'] || rowData['estado'] || '');
  const responsible = processResponsibles(rowData['responsible'] || rowData['Responsable'] || rowData['responsable'] || '');
  const importantDate = rowData['importantDate'] || rowData['Fecha Importante'] || rowData['fecha'] || '';
  const priority = validateTaskPriority(rowData['priority'] || rowData['Prioridad'] || rowData['prioridad'] || '');
  const comment = rowData['comment'] || rowData['Comentario'] || rowData['comentario'] || '';
  
  // Para las áreas vinculadas, procesamos texto con separaciones por comas
  let linkedAreas: string[] = [];
  const areasField = rowData['linkedAreas'] || rowData['Áreas Vinculadas'] || rowData['areas'] || '';
  
  // Log para verificar las áreas
  console.log('Áreas antes de procesar:', areasField);
  
  if (typeof areasField === 'string' && areasField.trim() !== '') {
    // Reemplazar los guiones por comas para normalizar separadores
    const cleanedAreasField = areasField.replace(/-/g, ',');
    linkedAreas = cleanedAreasField.split(',')
      .map(area => area.trim())
      .filter(area => area !== '');
    
    // Log áreas procesadas
    console.log('Áreas después de procesar:', linkedAreas);
  }
  
  // Log de campos procesados
  // Para el destacado, cualquier valor que sea "true", "sí", "si", "yes" o "1" se considera verdadero
  const highlightedValue = rowData['highlighted'] || rowData['Destacada'] || rowData['destacada'] || '';
  const highlighted = 
    typeof highlightedValue === 'boolean' ? highlightedValue :
    typeof highlightedValue === 'string' ? 
      ['true', 'sí', 'si', 'yes', '1'].includes(highlightedValue.toLowerCase()) : false;

  const result = {
    description,
    status,
    responsible,
    linkedAreas,
    importantDate,
    priority,
    highlighted,
    comment
  };
  
  console.log('Tarea procesada final:', result);
  
  return result;
}

// Función para importar tareas desde Google Sheets
export async function importTasksFromGoogleSheets(): Promise<Omit<Task, 'id'>[]> {
  try {
    // URL de la API de Google Sheets para acceder a la hoja como CSV
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv`;
    
    console.log('Iniciando importación desde Google Sheets...');
    
    // Realizar la petición para obtener los datos
    const response = await fetch(sheetUrl);
    
    if (!response.ok) {
      console.error(`Error al obtener datos de Google Sheets: ${response.statusText}`);
      return [];
    }
    
    const csvText = await response.text();
    console.log('Texto CSV recibido de longitud:', csvText.length);
    
    // Parsear el CSV manualmente
    const rows = parseCSV(csvText);
    console.log(`CSV parseado: ${rows.length} filas encontradas`);
    
    if (rows.length < 2) {
      console.warn('No se encontraron datos suficientes en la hoja de cálculo');
      return [];
    }
    
    // La primera fila contiene los encabezados
    const headers = rows[0];
    
    // Convertir las filas restantes en objetos de tarea
    const tasks: Omit<Task, 'id'>[] = [];
    
    for (let i = 1; i < rows.length; i++) {
      try {
        if (rows[i].some(cell => cell.trim() !== '')) {
          const task = mapRowToTask(rows[i], headers);
          tasks.push(task);
        }
      } catch (rowError) {
        console.error(`Error al procesar la fila ${i}:`, rowError);
        // Continuar con la siguiente fila
      }
    }
    
    console.log(`Importación completada: ${tasks.length} tareas importadas`);
    return tasks;
  } catch (error) {
    console.error('Error al importar tareas desde Google Sheets:', error);
    return []; // Devolver array vacío en lugar de lanzar error
  }
}

// Función simple para parsear CSV
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.trim() === '') continue;
    
    const row: string[] = [];
    let cell = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          // Doble comilla dentro de comillas - lo tomamos como una comilla literal
          cell += '"';
          i++;
        } else {
          // Cambiar el estado de estar dentro o fuera de comillas
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Fin de la celda
        row.push(cell);
        cell = '';
      } else {
        cell += char;
      }
    }
    
    // Añadir la última celda
    row.push(cell);
    rows.push(row);
  }
  
  return rows;
} 