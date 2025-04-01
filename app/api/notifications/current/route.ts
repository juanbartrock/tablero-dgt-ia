import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { cookies } from 'next/headers';

export async function GET() {
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

    // Obtener la notificación activa más reciente
    const result = await sql`
      SELECT n.*, 
             u.name as created_by_name,
             EXISTS (
               SELECT 1 
               FROM notification_views nv 
               WHERE nv.notification_id = n.id 
               AND nv.user_id = ${JSON.parse(authUser.value).id}
             ) as viewed
      FROM notifications n
      JOIN users u ON n.created_by_id = u.id
      WHERE n.status = 'active'
      ORDER BY n.timestamp DESC
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ notification: null });
    }

    return NextResponse.json({ notification: result.rows[0] });
  } catch (error) {
    console.error('Error al obtener notificación activa:', error);
    return NextResponse.json(
      { error: 'Error al obtener notificación activa' },
      { status: 500 }
    );
  }
} 