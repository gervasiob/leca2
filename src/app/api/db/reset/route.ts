import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function handleDbReset() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { ok: false, error: 'Esta acción solo está permitida en desarrollo.' },
      { status: 403 }
    );
  }

  try {
    console.log('Iniciando reseteo de la base de datos...');
    
    // Usamos --force para evitar la pregunta interactiva que bloquearía el script.
    const { stdout, stderr } = await execAsync('npx prisma migrate reset --force');
    
    if (stderr && !stderr.includes('generated')) {
      // A veces prisma generate imprime a stderr, lo ignoramos si es solo eso.
      console.error('Error durante prisma migrate reset:', stderr);
    }
    
    console.log('Resultado de prisma migrate reset:', stdout);
    return NextResponse.json({
      ok: true,
      message: 'La base de datos ha sido reseteada y poblada con éxito.',
      stdout,
      stderr,
    });

  } catch (e: any) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    console.error('Error al ejecutar el reseteo de la base de datos:', message);
    return NextResponse.json(
      { ok: false, error: 'Error al ejecutar npx prisma migrate reset.', details: message },
      { status: 500 }
    );
  }
}

export async function POST() {
  return handleDbReset();
}

export async function GET() {
  return handleDbReset();
}
