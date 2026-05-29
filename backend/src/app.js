const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

// Rutas
const authRoutes        = require('./modules/auth/auth.routes');
const usuariosRoutes    = require('./modules/usuarios/usuarios.routes');
const categoriasRoutes  = require('./modules/categorias/categorias.routes');
const productosRoutes   = require('./modules/productos/productos.routes');
const inventarioRoutes  = require('./modules/inventario/inventario.routes');
const pedidosRoutes     = require('./modules/pedidos/pedidos.routes');
const estadosRoutes     = require('./modules/estados-pedido/estados.routes');
const informesRoutes    = require('./modules/informes/informes.routes');
const ventasRoutes      = require('./modules/ventas/ventas.routes');

const app = express();

// ── Seguridad ──────────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting: máx 100 requests por 15 min por IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas solicitudes. Intenta más tarde.' }
}));

// ── Body parser ────────────────────────────────────────────
app.use(express.json());

// ── Health check ───────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', app: 'Sweet Home API' }));

// ── Rutas ──────────────────────────────────────────────────
app.use('/auth',       authRoutes);
app.use('/usuarios',   usuariosRoutes);
app.use('/categorias', categoriasRoutes);
app.use('/productos',  productosRoutes);
app.use('/inventario', inventarioRoutes);
app.use('/pedidos',    pedidosRoutes);
app.use('/estados',    estadosRoutes);
app.use('/informes',   informesRoutes);
app.use('/ventas',     ventasRoutes);

// ── Ruta no encontrada ─────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// ── Manejo de errores global ───────────────────────────────
app.use(errorHandler);

module.exports = app;
