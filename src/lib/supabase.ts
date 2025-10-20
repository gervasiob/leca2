import { createClient } from '@supabase/supabase-js'

// Esta configuración es para el cliente JS de Supabase, que puedes usar
// para funcionalidades como Autenticación, Storage, etc., en paralelo a Prisma.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  // No lanzamos error para no bloquear el build si solo se usa Prisma
  console.warn('Supabase URL or Key not provided. Supabase client-side features will be disabled.');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
