import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { cookies } from 'next/headers';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Obtener el usuario del cookie
    const cookieStore = cookies();
    const authUser = cookieStore.get('auth_user');

    if (!authUser) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const userData = JSON.parse(authUser.value);
    const userId = userData.id;
    const notificationId = parseInt(params.id);

    // Verificar si la notificación ha sido vista por el usuario
    const result = await sql`
      SELECT * FROM notification_views 
      WHERE notification_id = ${notificationId} 
      AND user_id = ${userId}
      LIMIT 1
    `;

    return NextResponse.json({ viewed: result.rows.length > 0 });
  } catch (error) {
    console.error('Error al verificar vista de notificación:', error);
    return NextResponse.json(
      { error: 'Error al verificar vista de notificación' },
      { status: 500 }
    );
  }
} 