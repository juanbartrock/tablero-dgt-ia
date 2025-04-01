import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyAdminAccess } from '@/app/lib/auth/auth-utils';

export async function DELETE() {
  try {
    // Verificar acceso de administrador
    const isAdmin = await verifyAdminAccess();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    // Desactivar todas las notificaciones
    await sql`
      UPDATE notifications 
      SET status = 'inactive' 
      WHERE status = 'active'
    `;

    return NextResponse.json({ message: 'Todas las notificaciones han sido desactivadas' });
  } catch (error) {
    console.error('Error al desactivar notificaciones:', error);
    return NextResponse.json(
      { error: 'Error al desactivar las notificaciones' },
      { status: 500 }
    );
  }
} 