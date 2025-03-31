import { NextRequest, NextResponse } from 'next/server';
import { getHighlightedTasks } from '@/app/lib/db'; // Asegúrate que esta función exista en db.ts

// GET - Obtener tareas destacadas
export async function GET(request: NextRequest) {
  try {
    const tasks = await getHighlightedTasks();
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching highlighted tasks:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor al obtener tareas destacadas' },
      { status: 500 }
    );
  }
} 