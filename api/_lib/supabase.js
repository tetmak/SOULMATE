import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cxkyyifqxbwidseofbgk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4a3l5aWZxeGJ3aWRzZW9mYmdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMTk3MDQsImV4cCI6MjA2MDg5NTcwNH0.sb_publishable_zjI0OggICM4s7wz0xpq2WA_Q_6JAHbN';

/**
 * Admin Supabase client — service_role key ile RLS bypass eder.
 * Sadece server-side (API endpoint) icinde kullanilmali.
 */
let _adminClient = null;

export function getSupabaseAdmin() {
    if (!_adminClient) {
        if (!SUPABASE_SERVICE_KEY) {
            throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
        }
        _adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
            auth: { autoRefreshToken: false, persistSession: false }
        });
    }
    return _adminClient;
}

/**
 * User-context Supabase client — kullanicinin JWT token'i ile islem yapar.
 * RLS policy'leri uygulanir.
 */
export function getSupabaseFromToken(accessToken) {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: {
            headers: { Authorization: 'Bearer ' + accessToken }
        },
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

export { SUPABASE_URL };
