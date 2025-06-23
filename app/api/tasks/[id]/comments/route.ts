import { NextRequest, NextResponse } from 'next/server';
import { getTaskComments, addTaskComment, deleteTaskComment } from '@/app/lib/db/tasks';

// GET: Obtener comentarios de una tarea
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = parseInt(params.id);
    if (isNaN(taskId)) {
      return NextResponse.json(
        { success: false, error: 'ID de tarea inválido' },
        { status: 400 }
      );
    }

    const comments = await getTaskComments(taskId);
    return NextResponse.json({ success: true, data: comments });
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST: Agregar comentario a una tarea
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = parseInt(params.id);
    if (isNaN(taskId)) {
      return NextResponse.json(
        { success: false, error: 'ID de tarea inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { comment, createdBy } = body;

    if (!comment || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Comentario y autor son requeridos' },
        { status: 400 }
      );
    }

    const newComment = await addTaskComment(taskId, comment, createdBy);
    return NextResponse.json({ success: true, data: newComment });
  } catch (error) {
    console.error('Error al agregar comentario:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar comentario
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json(
        { success: false, error: 'ID de comentario requerido' },
        { status: 400 }
      );
    }

    await deleteTaskComment(parseInt(commentId));
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 