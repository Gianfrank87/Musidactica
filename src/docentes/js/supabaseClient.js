import { createClient } from '@supabase/supabase-js';

// Reemplaza los valores de abajo con la URL y la Anon Key de tu proyecto de Supabase.
// También puedes usar variables de entorno de Vite (.env) si lo prefieres:
// VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://jppdwwthqivlugxjqsku.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_1Ev8Fyik5S1LxbyqQvjmvg_qFKAWJhp';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
