import { NextRequest, NextResponse } from 'next/server';
import { getActiveTasks } from '@/app/lib/db';

// GET - Obtener tareas activas (no terminadas)
export async function GET(request: NextRequest) {
  console.log('📥 API GET /api/tasks/active - Handler invocado');
  try {
    console.log('📥 API GET /api/tasks/active - Consultando tareas activas...');
    const tasks = await getActiveTasks();
    console.log(`📥 API GET /api/tasks/active - Se encontraron ${tasks.length} tareas activas`);
    
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
    console.error('Error getting active tasks:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor al obtener tareas activas' },
      { status: 500 }
    );
  }
} 