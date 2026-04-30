import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const finalUrl = (!supabaseUrl || supabaseUrl === 'your_supabase_project_url_here') ? 'https://placeholder.supabase.co' : supabaseUrl;
const finalKey = (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key_here') ? 'placeholder' : supabaseAnonKey;

if (finalUrl === 'https://placeholder.supabase.co') {
    console.warn("Supabase credentials not found. Please add them to your .env.local file.");
}

export const supabase = createClient(finalUrl, finalKey)
