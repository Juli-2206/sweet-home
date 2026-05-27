const supabase = require('../../config/supabase');

async function ventas({ desde, hasta }) {
  let query = supabase
    .from('pedidos')
    .select('id, total, creado_en, estados_pedido(nombre, color), cliente_nombre')
    .neq('estado_id', 5) // Excluir cancelados
    .order('creado_en', { ascending: false });

  if (desde) query = query.gte('creado_en', desde);
  if (hasta) query = query.lte('creado_en', hasta);

  const { data, error } = await query;
  if (error) throw error;

  const totalVentas = data.reduce((sum, p) => sum + Number(p.total), 0);
  return { pedidos: data, total_ventas: totalVentas, cantidad_pedidos: data.length };
}

async function productosTop({ desde, hasta, limit = 10 }) {
  let query = supabase
    .from('pedido_items')
    .select('cantidad, subtotal, productos(id, nombre, imagen_url)')
    .order('cantidad', { ascending: false })
    .limit(limit);

  const { data, error } = await query;
  if (error) throw error;

  // Agrupar por producto
  const mapa = {};
  data.forEach(item => {
    const id = item.productos.id;
    if (!mapa[id]) {
      mapa[id] = { ...item.productos, total_vendido: 0, total_ingresos: 0 };
    }
    mapa[id].total_vendido  += item.cantidad;
    mapa[id].total_ingresos += Number(item.subtotal);
  });

  return Object.values(mapa)
    .sort((a, b) => b.total_vendido - a.total_vendido)
    .slice(0, limit);
}

async function stockBajo() {
  const { data, error } = await supabase
    .from('productos')
    .select('id, nombre, stock, stock_minimo, imagen_url, categorias(nombre)')
    .eq('activo', true)
    .eq('usar_stock_minimo', true)
    .not('stock_minimo', 'is', null);

  if (error) throw error;

  return data.filter(p => p.stock <= p.stock_minimo)
    .sort((a, b) => a.stock - b.stock);
}

async function movimientos({ desde, hasta, tipo }) {
  let query = supabase
    .from('movimientos_inventario')
    .select('*, productos(nombre), usuarios(nombre)')
    .order('creado_en', { ascending: false });

  if (desde) query = query.gte('creado_en', desde);
  if (hasta) query = query.lte('creado_en', hasta);
  if (tipo)  query = query.eq('tipo', tipo);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

module.exports = { ventas, productosTop, stockBajo, movimientos };
