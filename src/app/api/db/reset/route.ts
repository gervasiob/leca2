
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function handleDbReset() {
  // Se cambia la condición para depender de la misma variable que el middleware.
  // Si el middleware está habilitado, esta ruta peligrosa se deshabilita.
  if (process.env.MIDDLEWARE_ENABLED === 'true') {
    return NextResponse.json(
      { ok: false, error: 'Esta acción solo está permitida cuando el middleware está deshabilitado.' },
      { status: 403 }
    );
  }

  try {
    console.log('Iniciando reseteo de la base de datos via npm script...');
    
    // Ejecuta el script 'db:reset' definido en package.json
    const { stdout, stderr } = await execAsync('npm run db:reset');
    
    if (stderr && !stderr.includes('generated')) {
      // A veces prisma generate imprime a stderr, lo ignoramos si es solo eso.
      console.error('Error durante npm run db:reset:', stderr);
    }
    
    console.log('Resultado de npm run db:reset:', stdout);
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
      { ok: false, error: 'Error al ejecutar npm run db:reset.', details: message },
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
