import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  if (process.env.MIDDLEWARE_ENABLED === 'true') {
    return NextResponse.json({ ok: false, error: 'This endpoint is disabled when middleware is enabled.' }, { status: 403 });
  }

  try {
    console.log('Executing database reset...');
    const { stdout, stderr } = await execAsync('npm run db:reset');
    console.log('stdout:', stdout);
    if (stderr) {
      console.error('stderr:', stderr);
      if (stderr.toLowerCase().includes('error')) {
         throw new Error(stderr);
      }
    }
    return NextResponse.json({ ok: true, message: 'Database reset and seeded successfully.', output: stdout });
  } catch (e: any) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error executing db:reset';
    console.error('Error executing npm run db:reset:', errorMessage);
    return NextResponse.json({ ok: false, error: 'Error al ejecutar npm run db:reset.', details: errorMessage }, { status: 500 });
  }
}
