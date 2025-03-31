import { NextRequest, NextResponse } from 'next/server';
import { getLastUpdateDate } from '@/app/lib/db';

// GET - Obtener la fecha de la última actualización de tarea
export async function GET(request: NextRequest) {
  try {
    const lastUpdate = await getLastUpdateDate();
    return NextResponse.json({ lastUpdate });
  } catch (error) {
    console.error('Error fetching last update date:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor al obtener la fecha de última actualización' },
      { status: 500 }
    );
  }
} 