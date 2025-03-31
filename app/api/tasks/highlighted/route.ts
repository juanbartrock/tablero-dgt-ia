import { NextRequest, NextResponse } from 'next/server';
import { getHighlightedTasks, getAllTasks } from '@/app/lib/db'; // Asegúrate que estas funciones existan en db.ts

// GET - Obtener tareas destacadas
export async function GET(request: NextRequest) {
  console.log('📥 API GET /api/tasks/highlighted - Handler invocado');
  try {
    console.log('📥 API GET /api/tasks/highlighted - Llamando a getHighlightedTasks()...');
    
    // Obtener todas las tareas y filtrar por highlighted=true directamente
    console.log('📥 API GET /api/tasks/highlighted - Probando método alternativo...');
    const allTasks = await getAllTasks();
    console.log(`📥 API GET /api/tasks/highlighted - getAllTasks() devolvió ${allTasks.length} tareas`);
    
    // Filtrar tareas destacadas
    const tasks = allTasks.filter(t => t.highlighted === true);
    console.log(`📥 API GET /api/tasks/highlighted - Después de filtrar, hay ${tasks.length} tareas destacadas`);
    
    if (tasks.length > 0) {
      console.log('📊 Tareas destacadas encontradas (IDs):', tasks.map(t => t.id).join(', '));
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