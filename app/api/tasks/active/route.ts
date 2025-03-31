import { NextRequest, NextResponse } from 'next/server';
import { getActiveTasks } from '@/app/lib/db';

// GET - Obtener tareas activas (no terminadas)
export async function GET(request: NextRequest) {
  try {
    const tasks = await getActiveTasks();
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching active tasks:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor al obtener tareas activas' },
      { status: 500 }
    );
  }
} 