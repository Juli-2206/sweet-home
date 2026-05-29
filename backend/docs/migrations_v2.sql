-- ============================================================
-- Sweet Home — Migración v2
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ── 1. VENTAS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ventas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
  talla       TEXT,
  color       TEXT,
  precio      NUMERIC(12,2) NOT NULL,
  cantidad    INTEGER        NOT NULL DEFAULT 1,
  notas       TEXT,
  fecha       TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- RLS: solo usuarios autenticados pueden leer/escribir
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ventas_auth" ON ventas
  FOR ALL USING (auth.role() = 'authenticated');

-- ── 2. TIPOS_ENTREGA ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tipos_entrega (
  id     SERIAL PRIMARY KEY,
  nombre TEXT    NOT NULL UNIQUE,
  activo BOOLEAN NOT NULL DEFAULT true
);

-- Datos iniciales
INSERT INTO tipos_entrega (nombre) VALUES
  ('Presencial'),
  ('Moto'),
  ('Transportadora')
ON CONFLICT (nombre) DO NOTHING;

-- RLS
ALTER TABLE tipos_entrega ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tipos_entrega_auth" ON tipos_entrega
  FOR ALL USING (auth.role() = 'authenticated');

-- ── 3. ENVIOS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS envios (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cedula       TEXT,
  nombre       TEXT NOT NULL,
  celular      TEXT,
  direccion    TEXT NOT NULL,
  tipo_entrega TEXT NOT NULL,
  numero_guia  TEXT,
  estado_id    UUID REFERENCES estados_pedido(id) ON DELETE SET NULL,
  notas        TEXT,
  fecha        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE envios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "envios_auth" ON envios
  FOR ALL USING (auth.role() = 'authenticated');

-- ── 4. TÍTULOS DE IMÁGENES ──────────────────────────────────
-- Columna paralela a "imagenes text[]" para guardar el título de cada foto
ALTER TABLE productos
  ADD COLUMN IF NOT EXISTS imagenes_titulos text[];

-- ── FIN ──────────────────────────────────────────────────────
