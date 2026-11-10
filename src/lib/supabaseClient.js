import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * The Supabase client, or null when the two env variables are not set
 * (see .env.example). A null client means "local mode": the library saves to
 * this browser only, which is handy while developing.
 */
export const supabase = url && key ? createClient(url, key) : null;
