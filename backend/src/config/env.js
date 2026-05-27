const REQUIRED = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];

function validateEnv() {
  const missing = REQUIRED.filter(key => !process.env[key]);
  if (missing.length) {
    console.error(`❌ Variables de entorno faltantes: ${missing.join(', ')}`);
    console.error('Copia .env.example a .env y completa los valores.');
    process.exit(1);
  }
  console.log('✅ Variables de entorno validadas');
}

module.exports = { validateEnv };
