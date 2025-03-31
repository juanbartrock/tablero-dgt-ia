import { NextRequest, NextResponse } from 'next/server';
import { updateTask, deleteTask } from '@/app/lib/db';
import { Task } from '@/app/lib/types';

// PUT - Actualizar una tarea existente por ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id; // ID viene de la URL
    const taskData: Task = await request.json();

    // Validar que el ID en la URL coincida con el ID en el cuerpo (opcional pero recomendado)
    if (String(taskData.id) !== id) {
        return NextResponse.json(
            { message: 'El ID de la tarea en la URL y en el cuerpo no coinciden' },
            { status: 400 }
        );
    }

    // Validación básica (se podrían añadir más)
    if (!taskData || typeof taskData.description !== 'string' || !taskData.description.trim()) {
      return NextResponse.json(
        { message: 'Datos de tarea inválidos. La descripción es obligatoria.' },
        { status: 400 }
      );
    }

    const updatedTask = await updateTask(taskData);

    if (!updatedTask) {
      return NextResponse.json(
        { message: `Tarea con ID ${id} no encontrada para actualizar.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ task: updatedTask });

  } catch (error) {
    console.error(`Error updating task with ID ${params.id}:`, error);
    // Podríamos tener errores específicos de validación de ID aquí
    if (error instanceof Error && error.message.includes('Invalid task ID')) {
         return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: `Error interno del servidor al actualizar la tarea ${params.id}` },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una tarea por ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const deleted = await deleteTask(id);

    if (!deleted) {
      return NextResponse.json(
        { message: `Tarea con ID ${id} no encontrada para eliminar.` },
        { status: 404 }
      );
    }

    // Devolver éxito sin contenido o un mensaje simple
    // return new NextResponse(null, { status: 204 }); // No Content
    return NextResponse.json({ message: `Tarea con ID ${id} eliminada correctamente.` });

  } catch (error) {
    console.error(`Error deleting task with ID ${params.id}:`, error);
    if (error instanceof Error && error.message.includes('Invalid task ID')) {
         return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: `Error interno del servidor al eliminar la tarea ${params.id}` },
      { status: 500 }
    );
  }
} 