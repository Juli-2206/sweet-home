const { createClient } = require('@supabase/supabase-js');

// Service role key: acceso total, solo para el backend
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

module.exports = supabase;
