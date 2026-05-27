const supabase = require('../../config/supabase');
const { registrarMovimiento } = require('../inventario/inventario.service');

async function listar({ estado_id, desde, hasta }) {
  let query = supabase
    .from('pedidos')
    .select('*, estados_pedido(nombre, color), pedido_items(*, productos(nombre))')
    .order('creado_en', { ascending: false });

  if (estado_id) query = query.eq('estado_id', estado_id);
  if (desde)     query = query.gte('creado_en', desde);
  if (hasta)     query = query.lte('creado_en', hasta);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function crear({ cliente_nombre, cliente_tel, notas, items, usuario_id }) {
  // 1. Calcular total
  const total = items.reduce((sum, i) => sum + i.cantidad * i.precio_unit, 0);

  // 2. Crear pedido
  const { data: pedido, error } = await supabase
    .from('pedidos')
    .insert({ cliente_nombre, cliente_tel, notas, total, usuario_id })
    .select().single();
  if (error) throw error;

  // 3. Insertar items
  const itemsConPedido = items.map(i => ({ ...i, pedido_id: pedido.id }));
  const { error: errItems } = await supabase.from('pedido_items').insert(itemsConPedido);
  if (errItems) throw errItems;

  // 4. Registrar salida de inventario por cada item
  for (const item of items) {
    await registrarMovimiento({
      producto_id: item.producto_id,
      tipo: 'salida',
      cantidad: item.cantidad,
      motivo: `Pedido #${pedido.id} - ${cliente_nombre || 'Cliente'}`,
      pedido_id: pedido.id,
      usuario_id
    });
  }

  return pedido;
}

async function editar(id, payload) {
  const { data, error } = await supabase
    .from('pedidos').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

async function cambiarEstado(id, estado_id) {
  const { data, error } = await supabase
    .from('pedidos').update({ estado_id }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

module.exports = { listar, crear, editar, cambiarEstado };
