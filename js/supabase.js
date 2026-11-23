const SUPABASE_URL = "https://nfindimmcbdfgfamkehp.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_MPmvf5GMB64g63qErwBQtQ_AtZwrAyO";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
);

