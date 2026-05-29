const supabase = require('../../config/supabase');

async function listar({ producto_id, desde, hasta } = {}) {
  let query = supabase
    .from('ventas')
    .select('*, productos(nombre, imagen_url)')
    .order('fecha', { ascending: false });

  if (producto_id) query = query.eq('producto_id', producto_id);
  if (desde)       query = query.gte('fecha', desde);
  if (hasta)       query = query.lte('fecha', hasta);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function registrar({ producto_id, talla, color, precio, cantidad = 1, notas }) {
  if (!producto_id || !precio) {
    const err = new Error('producto_id y precio son requeridos');
    err.status = 400;
    throw err;
  }

  // Insertar la venta
  const { data: venta, error } = await supabase
    .from('ventas')
    .insert({ producto_id, talla: talla || null, color: color || null, precio, cantidad, notas: notas || null })
    .select()
    .single();
  if (error) throw error;

  // Descontar stock de la variante correspondiente
  if (talla) {
    const { data: variante } = await supabase
      .from('variantes_producto')
      .select('id, stock')
      .eq('producto_id', producto_id)
      .eq('talla', talla)
      .maybeSingle();

    if (variante) {
      const nuevoStock = Math.max(0, variante.stock - cantidad);
      await supabase
        .from('variantes_producto')
        .update({ stock: nuevoStock })
        .eq('id', variante.id);
    }
  }

  return venta;
}

async function resumen({ desde, hasta } = {}) {
  let query = supabase
    .from('ventas')
    .select('precio, cantidad, talla, color, fecha, productos(nombre)');

  if (desde) query = query.gte('fecha', desde);
  if (hasta) query = query.lte('fecha', hasta);

  const { data, error } = await query;
  if (error) throw error;

  const totalVentas  = data.length;
  const totalIngresos = data.reduce((sum, v) => sum + (Number(v.precio) * v.cantidad), 0);

  return { totalVentas, totalIngresos, ventas: data };
}

module.exports = { listar, registrar, resumen };
