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
    console.error('❌ Error obteniendo tareas destacadas:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor al obtener tareas destacadas' },
      { status: 500 }
    );
  }
} 