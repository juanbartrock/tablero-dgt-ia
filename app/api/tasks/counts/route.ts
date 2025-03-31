import { NextRequest, NextResponse } from 'next/server';
import { getTaskCounts } from '@/app/lib/db'; // Asegúrate que la función se llame así en db.ts

// GET - Obtener conteo de tareas por estado
export async function GET(request: NextRequest) {
  console.log('📊 API GET /api/tasks/counts - Consultando conteos de tareas');
  
  try {
    // Obtener los conteos más recientes
    const counts = await getTaskCounts();
    console.log('📊 API - Conteos obtenidos:', counts);
    
    // Configurar cabeceras para evitar caché
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    headers.set('Surrogate-Control', 'no-store');
    
    return new NextResponse(
      JSON.stringify({ counts }),
      { 
        status: 200,
        headers: headers
      }
    );
  } catch (error) {
    console.error('Error fetching task counts:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor al obtener conteos de tareas' },
      { status: 500 }
    );
  }
} 