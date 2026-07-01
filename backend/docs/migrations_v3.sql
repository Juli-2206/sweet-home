-- ============================================================
-- Sweet Home — Migración v3
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ── Color en variantes ───────────────────────────────────────
-- Agrega columna color a variantes_producto para manejar
-- stock por combinación talla + color.
ALTER TABLE variantes_producto
  ADD COLUMN IF NOT EXISTS color TEXT;

-- ── FIN ──────────────────────────────────────────────────────
