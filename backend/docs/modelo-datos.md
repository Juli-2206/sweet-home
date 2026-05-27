# Modelo de Datos — Sweet Home

## Tablas

---

### 1. `roles`
Define los perfiles de acceso del sistema.

| Campo       | Tipo        | Descripción                        |
|-------------|-------------|------------------------------------|
| id          | int (PK)    | Identificador                      |
| nombre      | varchar(50) | 'admin', 'negocios', 'usuario'     |
| descripcion | text        | Descripción del rol                |

**Datos iniciales:**
- 1 → admin
- 2 → negocios
- 3 → usuario

---

### 2. `usuarios`
Gestiona el acceso al sistema. Se apoya en Supabase Auth.

| Campo       | Tipo         | Descripción                             |
|-------------|--------------|-----------------------------------------|
| id          | uuid (PK)    | Mismo ID que Supabase Auth              |
| nombre      | varchar(100) | Nombre completo                         |
| email       | varchar(150) | Correo (único)                          |
| rol_id      | int (FK)     | Relación con `roles`                    |
| activo      | boolean      | Permite habilitar/deshabilitar usuarios |
| creado_en   | timestamp    | Fecha de creación                       |

---

### 3. `categorias`
Lista desplegable administrable desde el perfil Admin.

| Campo       | Tipo         | Descripción                             |
|-------------|--------------|-----------------------------------------|
| id          | serial (PK)  | Identificador                           |
| nombre      | varchar(100) | Ej: Edredones, Sábanas, Mantas          |
| activo      | boolean      | Permite ocultar sin borrar              |
| creado_en   | timestamp    | Fecha de creación                       |

---

### 4. `productos`
Catálogo de productos del negocio.

| Campo        | Tipo          | Descripción                              |
|--------------|---------------|------------------------------------------|
| id           | serial (PK)   | Identificador                            |
| nombre       | varchar(150)  | Nombre del producto                      |
| descripcion  | text          | Descripción detallada                    |
| precio       | numeric(12,2) | Precio de venta                          |
| imagen_url   | text          | URL de la imagen                         |
| categoria_id | int (FK)      | Relación con `categorias`                |
| stock        | int           | Unidades disponibles                     |
| stock_minimo | int (nullable)| Alerta cuando stock baja de este número. NULL = sin alerta |
| usar_stock_minimo | boolean  | Activa/desactiva la alerta de stock mínimo               |
| activo       | boolean       | Visible en tienda (no elimina el registro)|
| creado_en    | timestamp     | Fecha de creación                        |
| actualizado_en | timestamp   | Última modificación                      |

---

### 5. `movimientos_inventario`
Registro de cada salida manual de stock (pedidos por WhatsApp).

| Campo        | Tipo          | Descripción                                      |
|--------------|---------------|--------------------------------------------------|
| id           | serial (PK)   | Identificador                                    |
| producto_id  | int (FK)      | Producto afectado                                |
| tipo         | varchar(20)   | 'entrada' o 'salida'                             |
| cantidad     | int           | Unidades del movimiento                          |
| stock_antes  | int           | Stock antes del movimiento (auditoría)           |
| stock_despues| int           | Stock después del movimiento (auditoría)         |
| motivo       | text          | Descripción (ej: "Pedido WhatsApp cliente Juan") |
| usuario_id   | uuid (FK)     | Quién registró el movimiento                     |
| creado_en    | timestamp     | Fecha y hora del movimiento                      |

---

### 6. `pedidos`
Registro de pedidos recibidos por WhatsApp para informes.

| Campo        | Tipo          | Descripción                              |
|--------------|---------------|------------------------------------------|
| id           | serial (PK)   | Identificador                            |
| cliente_nombre | varchar(150)| Nombre del cliente                       |
| cliente_tel  | varchar(20)   | Teléfono/WhatsApp del cliente            |
| total        | numeric(12,2) | Total del pedido                         |
| estado       | varchar(30)   | 'pendiente', 'entregado', 'cancelado'    |
| usuario_id   | uuid (FK)     | Quién registró el pedido                 |
| creado_en    | timestamp     | Fecha del pedido                         |

---

### 7. `pedido_items`
Detalle de productos por pedido.

| Campo        | Tipo          | Descripción                              |
|--------------|---------------|------------------------------------------|
| id           | serial (PK)   | Identificador                            |
| pedido_id    | int (FK)      | Relación con `pedidos`                   |
| producto_id  | int (FK)      | Producto del ítem                        |
| cantidad     | int           | Unidades pedidas                         |
| precio_unit  | numeric(12,2) | Precio al momento de la venta            |
| subtotal     | numeric(12,2) | cantidad × precio_unit                   |

---

### 8. `estados_pedido` *(lista desplegable administrable)*
Permite que el Admin personalice los estados posibles de un pedido.

| Campo       | Tipo         | Descripción                  |
|-------------|--------------|------------------------------|
| id          | serial (PK)  | Identificador                |
| nombre      | varchar(50)  | Estado del pedido            |
| color       | varchar(10)  | Color hex para la UI         |
| orden       | int          | Orden de aparición en la UI  |
| activo      | boolean      | Habilitar/deshabilitar       |

**Estados iniciales (en orden):**
1. Pendiente → `#f59e0b`
2. En preparación → `#3b82f6`
3. Enviado → `#8b5cf6`
4. Entregado → `#22c55e`
5. Cancelado → `#ef4444`

---

## Relaciones

```
roles ←──────────── usuarios
categorias ←──────── productos
productos ←────────── movimientos_inventario
productos ←────────── pedido_items
pedidos ←──────────── pedido_items
usuarios ←─────────── movimientos_inventario
usuarios ←─────────── pedidos
estados_pedido ←────── pedidos
```

---

## Permisos por perfil (RLS)

| Tabla                  | Admin          | Negocios       | Usuario        |
|------------------------|----------------|----------------|----------------|
| roles                  | CRUD           | Solo lectura   | ✗              |
| usuarios               | CRUD           | Solo propio    | Solo propio    |
| categorias             | CRUD           | Solo lectura   | Solo lectura   |
| productos              | CRUD           | CRUD           | Solo lectura   |
| movimientos_inventario | CRUD           | CRUD           | ✗              |
| pedidos                | CRUD           | CRUD           | ✗              |
| pedido_items           | CRUD           | CRUD           | ✗              |
| estados_pedido         | CRUD           | Solo lectura   | ✗              |
