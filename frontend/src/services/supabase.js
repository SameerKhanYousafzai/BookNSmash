import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Verifying Auth Target URL: ', typeof supabaseUrl !== 'undefined');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase credentials are not set in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage // Explicitly define for Vite deployed SPA
  }
});
