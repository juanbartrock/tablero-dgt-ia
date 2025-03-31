import { NextRequest, NextResponse } from 'next/server';
import { getHighlightedTasks } from '@/app/lib/db'; // Asegúrate que esta función exista en db.ts

// GET - Obtener tareas destacadas
export async function GET(request: NextRequest) {
  console.log('📥 API GET /api/tasks/highlighted - Handler invocado');
  try {
    console.log('📥 API GET /api/tasks/highlighted - Llamando a getHighlightedTasks()...');
    const tasks = await getHighlightedTasks();
    console.log(`📥 API GET /api/tasks/highlighted - getHighlightedTasks() devolvió ${tasks.length} tareas destacadas`);
    
    if (tasks.length > 0) {
      console.log('📊 Primera tarea destacada:', tasks[0]);
    }
    
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('❌ Error obteniendo tareas destacadas:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor al obtener tareas destacadas' },
      { status: 500 }
    );
  }
} 