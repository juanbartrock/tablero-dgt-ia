import { NextRequest, NextResponse } from 'next/server';
import { importTasksFromGoogleSheets } from '@/app/lib/google-sheets-client';
import { createTask } from '@/app/lib/db';

// POST - Importar tareas desde Google Sheets
export async function POST(request: NextRequest) {
  console.log('📥 API POST /api/tasks/import-google-sheets - Handler invocado');
  
  try {
    // Importar tareas desde Google Sheets
    console.log('📥 API - Iniciando importación desde Google Sheets...');
    const tasks = await importTasksFromGoogleSheets();
    console.log(`📥 API - Importación completada: ${tasks.length} tareas obtenidas de Google Sheets`);
    
    if (tasks.length === 0) {
      return NextResponse.json({ 
        message: 'No se encontraron tareas para importar en la hoja de cálculo',
        tasksImported: 0 
      });
    }
    
    // Guardar las tareas en la base de datos
    console.log('📥 API - Iniciando guardado de tareas en la base de datos...');
    const savedTasks = [];
    const errors = [];
    
    for (const task of tasks) {
      try {
        console.log('📥 API - Guardando tarea:', task.description);
        const savedTask = await createTask(task);
        savedTasks.push(savedTask);
      } catch (err: any) {
        console.error('❌ Error al guardar tarea:', err);
        errors.push({
          task: task.description,
          error: err.message || 'Error desconocido'
        });
      }
    }
    
    console.log(`📥 API - Proceso finalizado: ${savedTasks.length} tareas guardadas, ${errors.length} errores`);
    
    return NextResponse.json({
      message: `Importación completada: ${savedTasks.length} tareas importadas, ${errors.length} errores`,
      tasksImported: savedTasks.length,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error: any) {
    console.error('❌ Error en la importación de tareas:', error);
    return NextResponse.json(
      { 
        message: 'Error al importar tareas: ' + (error.message || 'Error desconocido'),
        error: error.message || 'Error desconocido'
      },
      { status: 500 }
    );
  }
} 