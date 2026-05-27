-- ============================================================
-- SWEET HOME — Schema SQL para Supabase
-- ============================================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ROLES
-- ============================================================
CREATE TABLE roles (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(50)  NOT NULL UNIQUE,
  descripcion TEXT
);

INSERT INTO roles (nombre, descripcion) VALUES
  ('admin',    'Administrador del sistema. Acceso total.'),
  ('negocios', 'Gestiona catálogo, inventario e informes.'),
  ('usuario',  'Cliente general. Solo puede ver productos.');

-- ============================================================
-- 2. USUARIOS
-- (El id es el mismo de Supabase Auth)
-- ============================================================
CREATE TABLE usuarios (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre      VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  rol_id      INT          NOT NULL REFERENCES roles(id),
  activo      BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en   TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. CATEGORIAS
-- ============================================================
CREATE TABLE categorias (
  id         SERIAL PRIMARY KEY,
  nombre     VARCHAR(100) NOT NULL UNIQUE,
  activo     BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en  TIMESTAMP    NOT NULL DEFAULT NOW()
);

INSERT INTO categorias (nombre) VALUES
  ('Edredones'),
  ('Sábanas'),
  ('Mantas'),
  ('Alfombras'),
  ('Espejos'),
  ('Mesas'),
  ('Cortinas'),
  ('Accesorios');

-- ============================================================
-- 4. PRODUCTOS
-- ============================================================
CREATE TABLE productos (
  id                 SERIAL         PRIMARY KEY,
  nombre             VARCHAR(150)   NOT NULL,
  descripcion        TEXT,
  precio             NUMERIC(12,2)  NOT NULL,
  imagen_url         TEXT,
  categoria_id       INT            REFERENCES categorias(id),
  stock              INT            NOT NULL DEFAULT 0,
  stock_minimo       INT,                          -- NULL = sin alerta
  usar_stock_minimo  BOOLEAN        NOT NULL DEFAULT FALSE,
  activo             BOOLEAN        NOT NULL DEFAULT TRUE,
  creado_en          TIMESTAMP      NOT NULL DEFAULT NOW(),
  actualizado_en     TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- Trigger: actualiza "actualizado_en" automáticamente
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_productos_updated
  BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

-- ============================================================
-- 5. ESTADOS DE PEDIDO (lista administrable)
-- ============================================================
CREATE TABLE estados_pedido (
  id     SERIAL       PRIMARY KEY,
  nombre VARCHAR(50)  NOT NULL UNIQUE,
  color  VARCHAR(10)  NOT NULL DEFAULT '#6b7280',
  orden  INT          NOT NULL DEFAULT 0,
  activo BOOLEAN      NOT NULL DEFAULT TRUE
);

INSERT INTO estados_pedido (nombre, color, orden) VALUES
  ('Pendiente',       '#f59e0b', 1),
  ('En preparación',  '#3b82f6', 2),
  ('Enviado',         '#8b5cf6', 3),
  ('Entregado',       '#22c55e', 4),
  ('Cancelado',       '#ef4444', 5);

-- ============================================================
-- 6. PEDIDOS
-- ============================================================
CREATE TABLE pedidos (
  id              SERIAL         PRIMARY KEY,
  cliente_nombre  VARCHAR(150),
  cliente_tel     VARCHAR(20),
  total           NUMERIC(12,2)  NOT NULL DEFAULT 0,
  estado_id       INT            NOT NULL REFERENCES estados_pedido(id) DEFAULT 1,
  notas           TEXT,
  usuario_id      UUID           REFERENCES usuarios(id),
  creado_en       TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. PEDIDO_ITEMS
-- ============================================================
CREATE TABLE pedido_items (
  id           SERIAL         PRIMARY KEY,
  pedido_id    INT            NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id  INT            NOT NULL REFERENCES productos(id),
  cantidad     INT            NOT NULL,
  precio_unit  NUMERIC(12,2)  NOT NULL,
  subtotal     NUMERIC(12,2)  GENERATED ALWAYS AS (cantidad * precio_unit) STORED
);

-- ============================================================
-- 8. MOVIMIENTOS DE INVENTARIO
-- ============================================================
CREATE TABLE movimientos_inventario (
  id             SERIAL       PRIMARY KEY,
  producto_id    INT          NOT NULL REFERENCES productos(id),
  tipo           VARCHAR(20)  NOT NULL CHECK (tipo IN ('entrada', 'salida')),
  cantidad       INT          NOT NULL,
  stock_antes    INT          NOT NULL,
  stock_despues  INT          NOT NULL,
  motivo         TEXT,
  pedido_id      INT          REFERENCES pedidos(id),  -- vinculado si viene de un pedido
  usuario_id     UUID         REFERENCES usuarios(id),
  creado_en      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES (mejoran velocidad de consultas frecuentes)
-- ============================================================
CREATE INDEX idx_productos_categoria  ON productos(categoria_id);
CREATE INDEX idx_productos_activo     ON productos(activo);
CREATE INDEX idx_pedidos_estado       ON pedidos(estado_id);
CREATE INDEX idx_pedidos_usuario      ON pedidos(usuario_id);
CREATE INDEX idx_movimientos_producto ON movimientos_inventario(producto_id);
CREATE INDEX idx_movimientos_fecha    ON movimientos_inventario(creado_en);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Activar RLS en todas las tablas
ALTER TABLE roles                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios               ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias             ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE estados_pedido         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos                ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_inventario ENABLE ROW LEVEL SECURITY;

-- Función auxiliar: obtiene el rol del usuario autenticado
CREATE OR REPLACE FUNCTION get_rol()
RETURNS TEXT AS $$
  SELECT r.nombre
  FROM usuarios u
  JOIN roles r ON r.id = u.rol_id
  WHERE u.id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ── ROLES ──────────────────────────────────────────────────
CREATE POLICY "admin puede todo en roles"
  ON roles FOR ALL
  USING (get_rol() = 'admin');

CREATE POLICY "negocios y usuario leen roles"
  ON roles FOR SELECT
  USING (get_rol() IN ('negocios', 'usuario'));

-- ── USUARIOS ───────────────────────────────────────────────
CREATE POLICY "admin gestiona usuarios"
  ON usuarios FOR ALL
  USING (get_rol() = 'admin');

CREATE POLICY "usuario ve su propio perfil"
  ON usuarios FOR SELECT
  USING (id = auth.uid());

-- ── CATEGORIAS ─────────────────────────────────────────────
CREATE POLICY "admin gestiona categorias"
  ON categorias FOR ALL
  USING (get_rol() = 'admin');

CREATE POLICY "todos leen categorias activas"
  ON categorias FOR SELECT
  USING (activo = TRUE);

-- ── PRODUCTOS ──────────────────────────────────────────────
CREATE POLICY "admin y negocios gestionan productos"
  ON productos FOR ALL
  USING (get_rol() IN ('admin', 'negocios'));

CREATE POLICY "usuario ve productos activos"
  ON productos FOR SELECT
  USING (activo = TRUE);

-- ── ESTADOS PEDIDO ─────────────────────────────────────────
CREATE POLICY "admin gestiona estados"
  ON estados_pedido FOR ALL
  USING (get_rol() = 'admin');

CREATE POLICY "negocios lee estados"
  ON estados_pedido FOR SELECT
  USING (get_rol() IN ('negocios', 'admin'));

-- ── PEDIDOS ────────────────────────────────────────────────
CREATE POLICY "admin y negocios gestionan pedidos"
  ON pedidos FOR ALL
  USING (get_rol() IN ('admin', 'negocios'));

-- ── PEDIDO ITEMS ───────────────────────────────────────────
CREATE POLICY "admin y negocios gestionan items"
  ON pedido_items FOR ALL
  USING (get_rol() IN ('admin', 'negocios'));

-- ── MOVIMIENTOS INVENTARIO ─────────────────────────────────
CREATE POLICY "admin y negocios gestionan movimientos"
  ON movimientos_inventario FOR ALL
  USING (get_rol() IN ('admin', 'negocios'));
