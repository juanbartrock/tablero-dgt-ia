import { NextRequest, NextResponse } from 'next/server';
import { getAllTasks, createTask } from '@/app/lib/db';
import { Task } from '@/app/lib/types'; // Importar el tipo Task si es necesario validar

// GET - Obtener todas las tareas
export async function GET(request: NextRequest) {
  console.log('📥 API GET /api/tasks - Handler invocado');
  try {
    console.log('📥 API GET /api/tasks - Consultando todas las tareas...');
    const tasks = await getAllTasks();
    console.log(`📥 API GET /api/tasks - Se encontraron ${tasks.length} tareas`);
    
    // Configurar cabeceras para evitar caché
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    headers.set('Surrogate-Control', 'no-store');
    
    return new NextResponse(
      JSON.stringify({ tasks }),
      { 
        status: 200,
        headers: headers
      }
    );
  } catch (error) {
    console.error('Error getting all tasks:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor al obtener tareas' },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva tarea
export async function POST(request: NextRequest) {
  console.log('📥 API POST /api/tasks - Handler invocado');
  try {
    const taskData: Omit<Task, 'id'> = await request.json();
    console.log('📥 API POST /api/tasks - Datos recibidos:', taskData);

    // Validación básica (se podrían añadir más validaciones específicas)
    if (!taskData || typeof taskData.description !== 'string' || !taskData.description.trim()) {
      console.log('❌ API POST /api/tasks - Validación fallida: descripción requerida');
      return NextResponse.json(
        { message: 'Datos de tarea inválidos. La descripción es obligatoria.' },
        { status: 400 }
      );
    }

    // Asegurar campos opcionales si no vienen
    taskData.status = taskData.status || 'Pendiente';
    taskData.priority = taskData.priority || 'Media';
    taskData.linkedAreas = taskData.linkedAreas || [];
    console.log('📥 API POST /api/tasks - Llamando a createTask()...');
    
    const newTask = await createTask(taskData);
    console.log('✅ API POST /api/tasks - Tarea creada exitosamente:', newTask);
    
    return NextResponse.json({ task: newTask }, { status: 201 }); // 201 Created

  } catch (error) {
    console.error('❌ Error creando tarea:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor al crear la tarea' },
      { status: 500 }
    );
  }
} 