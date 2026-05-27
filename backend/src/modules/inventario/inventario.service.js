const supabase = require('../../config/supabase');

async function historial(producto_id) {
  const { data, error } = await supabase
    .from('movimientos_inventario')
    .select('*, usuarios(nombre)')
    .eq('producto_id', producto_id)
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return data;
}

async function registrarMovimiento({ producto_id, tipo, cantidad, motivo, pedido_id, usuario_id }) {
  // Obtener stock actual
  const { data: prod, error: errProd } = await supabase
    .from('productos').select('stock, usar_stock_minimo, stock_minimo').eq('id', producto_id).single();
  if (errProd) throw errProd;

  const stock_antes = prod.stock;
  const stock_despues = tipo === 'entrada'
    ? stock_antes + cantidad
    : stock_antes - cantidad;

  if (tipo === 'salida' && stock_despues < 0)
    throw { status: 400, expose: true, message: 'Stock insuficiente' };

  // Actualizar stock
  const { error: errStock } = await supabase
    .from('productos').update({ stock: stock_despues }).eq('id', producto_id);
  if (errStock) throw errStock;

  // Registrar movimiento
  const { data, error } = await supabase
    .from('movimientos_inventario')
    .insert({ producto_id, tipo, cantidad, stock_antes, stock_despues, motivo, pedido_id, usuario_id })
    .select().single();
  if (error) throw error;

  // Alerta de stock mínimo
  const alerta = prod.usar_stock_minimo && prod.stock_minimo !== null
    && stock_despues <= prod.stock_minimo;

  return { movimiento: data, stock_actual: stock_despues, alerta_stock_minimo: alerta };
}

module.exports = { historial, registrarMovimiento };
