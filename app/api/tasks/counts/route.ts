import { NextRequest, NextResponse } from 'next/server';
import { getTaskCounts } from '@/app/lib/db'; // Asegúrate que la función se llame así en db.ts

// GET - Obtener conteo de tareas por estado
export async function GET(request: NextRequest) {
  try {
    const counts = await getTaskCounts();
    return NextResponse.json({ counts });
  } catch (error) {
    console.error('Error fetching task counts:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor al obtener conteos de tareas' },
      { status: 500 }
    );
  }
} 