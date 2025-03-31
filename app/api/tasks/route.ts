import { NextRequest, NextResponse } from 'next/server';
import { getAllTasks, createTask } from '@/app/lib/db';
import { Task } from '@/app/lib/types'; // Importar el tipo Task si es necesario validar

// GET - Obtener todas las tareas
export async function GET(request: NextRequest) {
  try {
    const tasks = await getAllTasks();
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor al obtener tareas' },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva tarea
export async function POST(request: NextRequest) {
  try {
    const taskData: Omit<Task, 'id'> = await request.json();

    // Validación básica (se podrían añadir más validaciones específicas)
    if (!taskData || typeof taskData.description !== 'string' || !taskData.description.trim()) {
      return NextResponse.json(
        { message: 'Datos de tarea inválidos. La descripción es obligatoria.' },
        { status: 400 }
      );
    }

    // Asegurar campos opcionales si no vienen
    taskData.status = taskData.status || 'Pendiente';
    taskData.priority = taskData.priority || 'Media';
    taskData.linkedAreas = taskData.linkedAreas || [];
    // ... otras validaciones o valores por defecto si son necesarios

    const newTask = await createTask(taskData);
    
    return NextResponse.json({ task: newTask }, { status: 201 }); // 201 Created

  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor al crear la tarea' },
      { status: 500 }
    );
  }
} 