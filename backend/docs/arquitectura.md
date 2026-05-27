# Arquitectura del Backend — Sweet Home

## Estructura de carpetas

```
backend/
├── docs/                        # Documentación técnica
│   ├── modelo-datos.md
│   ├── schema.sql
│   └── arquitectura.md
│
├── src/
│   ├── config/
│   │   ├── supabase.js          # Cliente Supabase (usa variables de entorno)
│   │   └── env.js               # Validación de variables de entorno al arrancar
│   │
│   ├── middleware/
│   │   ├── auth.js              # Verifica JWT de Supabase, adjunta usuario al request
│   │   ├── roles.js             # Verifica que el usuario tenga el rol requerido
│   │   └── errorHandler.js      # Manejo centralizado de errores
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js   # POST /login, POST /logout
│   │   │   └── auth.controller.js
│   │   │
│   │   ├── usuarios/
│   │   │   ├── usuarios.routes.js
│   │   │   ├── usuarios.controller.js
│   │   │   └── usuarios.service.js
│   │   │
│   │   ├── categorias/
│   │   │   ├── categorias.routes.js
│   │   │   ├── categorias.controller.js
│   │   │   └── categorias.service.js
│   │   │
│   │   ├── productos/
│   │   │   ├── productos.routes.js
│   │   │   ├── productos.controller.js
│   │   │   └── productos.service.js
│   │   │
│   │   ├── inventario/
│   │   │   ├── inventario.routes.js
│   │   │   ├── inventario.controller.js
│   │   │   └── inventario.service.js
│   │   │
│   │   ├── pedidos/
│   │   │   ├── pedidos.routes.js
│   │   │   ├── pedidos.controller.js
│   │   │   └── pedidos.service.js
│   │   │
│   │   ├── estados-pedido/
│   │   │   ├── estados.routes.js
│   │   │   ├── estados.controller.js
│   │   │   └── estados.service.js
│   │   │
│   │   └── informes/
│   │       ├── informes.routes.js
│   │       ├── informes.controller.js
│   │       └── informes.service.js
│   │
│   └── app.js                   # Express app: middlewares globales + rutas
│
├── .env                         # Variables de entorno (NO subir a Git)
├── .env.example                 # Plantilla con las variables necesarias
├── package.json
└── server.js                    # Punto de entrada: levanta el servidor
```

---

## Endpoints por módulo

### Auth
| Método | Ruta            | Acceso  | Descripción             |
|--------|-----------------|---------|-------------------------|
| POST   | /auth/login     | Público | Inicia sesión           |
| POST   | /auth/logout    | Auth    | Cierra sesión           |
| GET    | /auth/me        | Auth    | Devuelve usuario actual |

### Usuarios *(solo Admin)*
| Método | Ruta              | Descripción                  |
|--------|-------------------|------------------------------|
| GET    | /usuarios         | Lista todos los usuarios     |
| POST   | /usuarios         | Crea usuario con rol         |
| PUT    | /usuarios/:id     | Edita usuario                |
| PATCH  | /usuarios/:id/toggle | Activa/desactiva          |

### Categorías
| Método | Ruta                   | Acceso          | Descripción           |
|--------|------------------------|-----------------|-----------------------|
| GET    | /categorias            | Público         | Lista activas         |
| GET    | /categorias/todas      | Admin           | Lista todas           |
| POST   | /categorias            | Admin           | Crea categoría        |
| PUT    | /categorias/:id        | Admin           | Edita categoría       |
| PATCH  | /categorias/:id/toggle | Admin           | Activa/desactiva      |

### Productos
| Método | Ruta                    | Acceso          | Descripción                  |
|--------|-------------------------|-----------------|------------------------------|
| GET    | /productos              | Público         | Lista activos (con filtros)  |
| GET    | /productos/todos        | Admin/Negocios  | Lista todos                  |
| GET    | /productos/:id          | Público         | Detalle de producto          |
| POST   | /productos              | Admin/Negocios  | Crea producto                |
| PUT    | /productos/:id          | Admin/Negocios  | Edita producto               |
| PATCH  | /productos/:id/toggle   | Admin/Negocios  | Activa/desactiva             |

### Inventario
| Método | Ruta                          | Acceso         | Descripción              |
|--------|-------------------------------|----------------|--------------------------|
| GET    | /inventario/:producto_id      | Admin/Negocios | Historial de movimientos |
| POST   | /inventario/entrada           | Admin/Negocios | Registra entrada         |
| POST   | /inventario/salida            | Admin/Negocios | Registra salida manual   |

### Pedidos
| Método | Ruta                    | Acceso         | Descripción              |
|--------|-------------------------|----------------|--------------------------|
| GET    | /pedidos                | Admin/Negocios | Lista pedidos            |
| POST   | /pedidos                | Admin/Negocios | Crea pedido              |
| PUT    | /pedidos/:id            | Admin/Negocios | Edita pedido             |
| PATCH  | /pedidos/:id/estado     | Admin/Negocios | Cambia estado            |

### Informes *(Admin y Negocios)*
| Método | Ruta                          | Descripción                        |
|--------|-------------------------------|------------------------------------|
| GET    | /informes/ventas              | Ventas por período                 |
| GET    | /informes/productos-top       | Productos más vendidos             |
| GET    | /informes/stock-bajo          | Productos bajo stock mínimo        |
| GET    | /informes/movimientos         | Historial completo de inventario   |

---

## Variables de entorno (.env)

```env
PORT=3000
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
FRONTEND_URL=https://juli-2206.github.io
```
