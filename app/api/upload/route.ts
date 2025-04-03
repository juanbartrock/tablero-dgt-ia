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

    // Convertir el archivo a base64
    const buffer = await file.arrayBuffer();
    const base64File = Buffer.from(buffer).toString('base64');

    // Subir el archivo a Supabase Storage usando fetch
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/st-tablero-dgt-ia/${filePath}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/octet-stream',
        'x-upsert': 'true'
      },
      body: base64File
    });

    if (!response.ok) {
      throw new Error('Error al subir el archivo');
    }

    // Obtener la URL pública del archivo
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/st-tablero-dgt-ia/${filePath}`;

    return NextResponse.json({
      url: publicUrl,
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