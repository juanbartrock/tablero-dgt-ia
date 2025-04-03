import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Generar un nombre único para el archivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `task-files/${fileName}`;

    // Obtener el buffer del archivo
    const buffer = await file.arrayBuffer();

    // Subir el archivo a Supabase Storage usando fetch
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/st-tablero-dgt-ia/${filePath}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': file.type,
        'x-upsert': 'true'
      },
      body: buffer
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error al subir el archivo:', errorData);
      throw new Error('Error al subir el archivo');
    }

    // Obtener la URL firmada del archivo
    const signedUrlResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/sign/st-tablero-dgt-ia/${filePath}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          expiresIn: 31536000
        })
      }
    );

    if (!signedUrlResponse.ok) {
      console.error('Error al obtener la URL firmada:', await signedUrlResponse.text());
      throw new Error('Error al obtener la URL firmada');
    }

    const { signedURL } = await signedUrlResponse.json();

    return NextResponse.json({
      url: signedURL,
      name: file.name
    });

  } catch (error) {
    console.error('Error en el endpoint de subida:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 