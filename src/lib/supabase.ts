import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if credentials are properly set up and not the default placeholder
export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-ref') &&
  !supabaseAnonKey.includes('your-supabase-publishable-anon-key')
);

// If configured, initialize live Supabase client.
// Otherwise provide a fallback client to prevent runtime crashes during initial preview.
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : createClient('https://syllabo-preview.supabase.co', 'placeholder-anon-key-preview-mode', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
