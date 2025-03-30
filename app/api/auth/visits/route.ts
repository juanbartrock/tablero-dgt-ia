import { NextRequest, NextResponse } from 'next/server';
import { authDb } from '@/app/lib/auth/db';

export async function GET(request: NextRequest) {
  try {
    // Obtener todas las visitas
    const visits = await authDb.getAllVisits();
    
    console.log('API: Total de visitas encontradas:', visits.length);
    console.log('API: Primera visita:', visits[0]);
    console.log('API: Última visita:', visits[visits.length - 1]);
    
    return NextResponse.json({ visits });
  } catch (error) {
    console.error('Error al obtener visitas:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 