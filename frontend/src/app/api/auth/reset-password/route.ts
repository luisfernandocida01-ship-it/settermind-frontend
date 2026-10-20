import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://settermind-flask-template.onrender.com';
    
    // Llamada de servidor a servidor (sin problemas de CORS en navegador)
    const response = await fetch(`${backendUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { detail: error.message || 'Error al conectar con el servidor backend' },
      { status: 500 }
    );
  }
}
