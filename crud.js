const API_URL = 'https://sweet-home-zw3h.onrender.com';

// ===== ESTADO =====
let token    = sessionStorage.getItem('sh_token');
let usuario  = null;
try { usuario = JSON.parse(sessionStorage.getItem('sh_usuario')); } catch(e) {}
let productos     = [];
let categorias    = [];
let editId        = null;
let variantesData = []; // [{id?, talla, precio, stock}]
let coloresData   = []; // ['Azul', 'Rojo', ...]

// ===== TOKEN / REFRESH =====
let refreshToken = null;
try { refreshToken = sessionStorage.getItem('sh_refresh'); } catch(e) {}

function agendarRefresh() {
  setTimeout(async () => {
    if (!refreshToken) return;
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      if (res.ok) {
        const data = await res.json();
        token        = data.token;
        refreshToken = data.refresh_token;
        sessionStorage.setItem('sh_token',   token);
        sessionStorage.setItem('sh_refresh', refreshToken);
        agendarRefresh();
      } else {
        mostrarLogin();
      }
    } catch(err) { console.error('Error al refrescar token:', err); }
  }, 50 * 60 * 1000); // refrescar cada 50 minutos
}

// ===== ELEMENTOS =====
const form         = document.getElementById("productForm");
const productList  = document.getElementById("productList");
const btnGuardar   = document.getElementById("btnGuardar");
const btnAbrirModal  = document.getElementById("btnAbrirModal");
const btnCerrarModal = document.getElementById("btnCerrarModal");
const modalOverlay   = document.getElementById("modalOverlay");
const modalTitle     = document.getElementById("modalTitle");
const loginOverlay   = document.getElementById("loginOverlay");
const loginForm      = document.getElementById("loginForm");
const loginError     = document.getElementById("loginError");
const btnLogout      = document.getElementById("btnLogout");
const usuarioNombre  = document.getElementById("usuarioNombre");
const adminMain      = document.getElementById("adminMain");
const btnLoginSubmit = document.getElementById("btnLoginSubmit");
const btnNuevaCat      = document.getElementById("btnNuevaCat");
const nuevaCatForm     = document.getElementById("nuevaCatForm");
const btnGuardarCat    = document.getElementById("btnGuardarCat");
const btnCancelarCat   = document.getElementById("btnCancelarCat");
const btnGestionarCats = document.getElementById("btnGestionarCats");
const listaCategorias  = document.getElementById("listaCategorias");

// ===== MODAL CONFIRMACIÓN =====
const modalConfirm      = document.getElementById("modalConfirm");
const confirmMensaje    = document.getElementById("confirmMensaje");
const btnConfirmAceptar = document.getElementById("btnConfirmAceptar");
const btnConfirmCancelar= document.getElementById("btnConfirmCancelar");

function confirmar(mensaje, textoBoton = 'Eliminar') {
  return new Promise(resolve => {
    confirmMensaje.textContent       = mensaje;
    btnConfirmAceptar.textContent    = textoBoton;
    btnConfirmCancelar.style.display = '';
    modalConfirm.classList.add("active");

    const aceptar = () => { cleanup(); resolve(true);  };
    const cancelar= () => { cleanup(); resolve(false); };

    function cleanup() {
      modalConfirm.classList.remove("active");
      btnConfirmAceptar.removeEventListener('click', aceptar);
      btnConfirmCancelar.removeEventListener('click', cancelar);
    }

    btnConfirmAceptar.addEventListener('click', aceptar);
    btnConfirmCancelar.addEventListener('click', cancelar);
  });
}

function alertar(mensaje) {
  return new Promise(resolve => {
    confirmMensaje.textContent       = mensaje;
    btnConfirmAceptar.textContent    = 'Aceptar';
    btnConfirmCancelar.style.display = 'none';
    modalConfirm.classList.add("active");

    const cerrar = () => {
      btnConfirmCancelar.style.display = '';
      modalConfirm.classList.remove("active");
      btnConfirmAceptar.removeEventListener('click', cerrar);
      resolve();
    };
    btnConfirmAceptar.addEventListener('click', cerrar);
  });
}

// ===== HEADERS AUTENTICADOS =====
function headers() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// ===== LOGIN =====
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  btnLoginSubmit.disabled = true;
  btnLoginSubmit.textContent = 'Ingresando...';

  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Credenciales incorrectas');

    token        = data.token;
    refreshToken = data.refresh_token;
    usuario      = data.usuario;
    sessionStorage.setItem('sh_token',   token);
    sessionStorage.setItem('sh_refresh', refreshToken);
    sessionStorage.setItem('sh_usuario', JSON.stringify(usuario));

    mostrarPanel();
    agendarRefresh();
  } catch(err) {
    loginError.textContent = err.message;
  } finally {
    btnLoginSubmit.disabled = false;
    btnLoginSubmit.textContent = 'Ingresar';
  }
});

// ===== LOGOUT =====
btnLogout.addEventListener('click', () => {
  sessionStorage.removeItem('sh_token');
  sessionStorage.removeItem('sh_refresh');
  sessionStorage.removeItem('sh_usuario');
  token        = null;
  refreshToken = null;
  usuario      = null;
  mostrarLogin();
});

// ===== MOSTRAR / OCULTAR =====
function mostrarLogin() {
  loginOverlay.style.display = 'flex';
  adminMain.style.display    = 'none';
}

function mostrarPanel() {
  loginOverlay.style.display = 'none';
  adminMain.style.display    = 'block';
  usuarioNombre.textContent  = usuario ? usuario.nombre : '';
  document.querySelectorAll('.nav-admin').forEach(el => el.style.display = '');
  init();
}

// ===== INIT =====
async function init() {
  await Promise.all([cargarCategorias(), cargarProductos()]);
}

// ===== CARGAR CATEGORÍAS =====
async function cargarCategorias() {
  try {
    const res = await fetch(`${API_URL}/categorias`);
    categorias = await res.json();
    poblarSelectCategorias();
  } catch(err) {
    console.error('Error cargando categorías:', err);
  }
}

function poblarSelectCategorias() {
  const select = document.getElementById('categoria_id');
  const valorActual = select.value;
  select.innerHTML = '<option value="">Sin categoría</option>';
  categorias.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = cat.nombre;
    select.appendChild(opt);
  });
  if (valorActual) select.value = valorActual;
}

// ===== NUEVA CATEGORÍA =====
btnNuevaCat.addEventListener('click', () => {
  const visible = nuevaCatForm.style.display === 'flex';
  nuevaCatForm.style.display = visible ? 'none' : 'flex';
  if (!visible) document.getElementById('nuevaCatNombre').focus();
});

btnCancelarCat.addEventListener('click', () => {
  nuevaCatForm.style.display = 'none';
  document.getElementById('nuevaCatNombre').value = '';
});

btnGuardarCat.addEventListener('click', async () => {
  const nombre = document.getElementById('nuevaCatNombre').value.trim();
  if (!nombre) return;

  try {
    btnGuardarCat.disabled = true;
    btnGuardarCat.textContent = '...';

    const res = await fetch(`${API_URL}/categorias`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ nombre })
    });
    const cat = await res.json();
    if (!res.ok) throw new Error(cat.error || 'Error al crear categoría');

    categorias.push(cat);
    poblarSelectCategorias();
    renderListaCategorias();
    document.getElementById('categoria_id').value = cat.id;

    nuevaCatForm.style.display = 'none';
    document.getElementById('nuevaCatNombre').value = '';
  } catch(err) {
    await alertar(err.message);
  } finally {
    btnGuardarCat.disabled = false;
    btnGuardarCat.textContent = 'Agregar';
  }
});

// ===== GESTIONAR CATEGORÍAS =====
btnGestionarCats.addEventListener('click', () => {
  const visible = listaCategorias.style.display === 'block';
  listaCategorias.style.display = visible ? 'none' : 'block';
  btnGestionarCats.textContent  = visible ? 'Gestionar categorías' : 'Cerrar gestión';
  if (!visible) renderListaCategorias();
});

function renderListaCategorias() {
  if (categorias.length === 0) {
    listaCategorias.innerHTML = `<p class="cats-vacio">No hay categorías aún.</p>`;
    return;
  }
  listaCategorias.innerHTML = categorias.map(cat => `
    <div class="cat-item">
      <span>${cat.nombre}</span>
      <button type="button" class="btn-eliminar-cat" data-id="${cat.id}" title="Eliminar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </button>
    </div>
  `).join('');

  listaCategorias.querySelectorAll('.btn-eliminar-cat').forEach(btn => {
    btn.addEventListener('click', () => eliminarCategoria(btn.dataset.id));
  });
}

async function eliminarCategoria(id) {
  const cat = categorias.find(c => c.id == id);
  if (!await confirmar(`¿Eliminar la categoría "${cat?.nombre}"?`)) return;

  try {
    const res = await fetch(`${API_URL}/categorias/${id}`, {
      method: 'DELETE',
      headers: headers()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    categorias = categorias.filter(c => c.id != id);
    poblarSelectCategorias();
    renderListaCategorias();
  } catch(err) {
    await alertar(err.message);
  }
}

// ===== CARGAR PRODUCTOS =====
async function cargarProductos() {
  try {
    productList.innerHTML = `<div class="empty-state">Cargando...</div>`;
    const res = await fetch(`${API_URL}/productos/todos`, { headers: headers() });
    if (res.status === 401) { mostrarLogin(); return; }
    if (!res.ok) throw new Error('Error al cargar productos');
    productos = await res.json();
    renderProductos();
  } catch(err) {
    productList.innerHTML = `<div class="empty-state">Error al cargar productos.</div>`;
    console.error(err);
  }
}

// ===== IMÁGENES MÚLTIPLES (máx 6) =====
const imagenesGrid = document.getElementById("imagenesGrid");
const uploadStatus = document.getElementById("uploadStatus");
let imagenesUrls   = [];
const MAX_IMGS     = 6;

function renderImagenesGrid() {
  imagenesGrid.innerHTML = '';

  imagenesUrls.forEach((url, i) => {
    const slot = document.createElement('div');
    slot.className = 'img-slot filled';
    slot.innerHTML = `
      <img src="${url}" alt="Imagen ${i+1}">
      <button type="button" class="img-slot-remove" data-index="${i}" title="Eliminar">✕</button>
      ${i === 0 ? '<span class="img-principal">Principal</span>' : ''}`;
    slot.querySelector('.img-slot-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      imagenesUrls.splice(i, 1);
      renderImagenesGrid();
    });
    imagenesGrid.appendChild(slot);
  });

  if (imagenesUrls.length < MAX_IMGS) {
    const slot = document.createElement('div');
    slot.className = 'img-slot empty';
    slot.innerHTML = `
      <input type="file" accept="image/*" style="display:none" class="slot-input">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b87563" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      <span>${imagenesUrls.length === 0 ? 'Agregar imagen' : '+ Agregar'}</span>`;

    const fileInput = slot.querySelector('.slot-input');
    slot.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => handleSlotUpload(fileInput));
    imagenesGrid.appendChild(slot);
  }
}

async function handleSlotUpload(input) {
  const file = input.files[0];
  if (!file) return;

  uploadStatus.textContent = 'Subiendo imagen...';
  uploadStatus.style.color = '#999';

  try {
    const formData = new FormData();
    formData.append('imagen', file);
    const res  = await fetch(`${API_URL}/productos/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al subir');

    imagenesUrls.push(data.url);
    renderImagenesGrid();
    uploadStatus.textContent = '✓ Imagen subida';
    uploadStatus.style.color = '#27ae60';
    setTimeout(() => uploadStatus.textContent = '', 2000);
  } catch(err) {
    uploadStatus.textContent = '✗ ' + err.message;
    uploadStatus.style.color = '#d94f4f';
  }
}

function resetUpload() {
  imagenesUrls = [];
  uploadStatus.textContent = '';
  renderImagenesGrid();
}

// ===== VARIANTES =====
function renderVariantesRows() {
  const container = document.getElementById('variantesRows');
  if (!container) return;

  if (variantesData.length === 0) {
    container.innerHTML = `<div class="variantes-empty">Sin variantes. Agrega al menos una talla.</div>`;
    return;
  }

  container.innerHTML = variantesData.map((v, i) => `
    <div class="variante-row" data-index="${i}">
      <input type="text"   class="v-talla"  placeholder="Ej: Queen"  value="${v.talla  || ''}"  data-i="${i}">
      <input type="number" class="v-precio" placeholder="0"  min="0" value="${v.precio ?? ''}"  data-i="${i}">
      <input type="number" class="v-stock"  placeholder="0"  min="0" value="${v.stock  ?? 0}"   data-i="${i}">
      <button type="button" class="btn-del-variante" data-i="${i}" title="Eliminar">✕</button>
    </div>
  `).join('');

  // Sync inputs → variantesData en tiempo real
  container.querySelectorAll('.v-talla').forEach(el =>
    el.addEventListener('input', e => { variantesData[+e.target.dataset.i].talla = e.target.value; }));
  container.querySelectorAll('.v-precio').forEach(el =>
    el.addEventListener('input', e => { variantesData[+e.target.dataset.i].precio = parseFloat(e.target.value) || 0; }));
  container.querySelectorAll('.v-stock').forEach(el =>
    el.addEventListener('input', e => { variantesData[+e.target.dataset.i].stock = parseInt(e.target.value, 10) || 0; }));

  container.querySelectorAll('.btn-del-variante').forEach(btn =>
    btn.addEventListener('click', () => {
      variantesData.splice(+btn.dataset.i, 1);
      renderVariantesRows();
    })
  );
}

document.getElementById('btnAddVariante').addEventListener('click', () => {
  variantesData.push({ talla: '', color: '', stock: 0 });
  renderVariantesRows();
  // Focus en el último input de talla
  const rows = document.querySelectorAll('.variante-row');
  if (rows.length) rows[rows.length - 1].querySelector('.v-talla')?.focus();
});

async function cargarVariantes(productoId) {
  try {
    const res = await fetch(`${API_URL}/productos/${productoId}/variantes`);
    variantesData = await res.json();
  } catch(err) {
    console.error('Error cargando variantes:', err);
    variantesData = [];
  }
  renderVariantesRows();
}

async function guardarVariantes(productoId) {
  // Filtra filas sin talla
  const validas = variantesData.filter(v => String(v.talla || '').trim());
  const res = await fetch(`${API_URL}/productos/${productoId}/variantes`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ variantes: validas })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Error al guardar variantes');
  }
}

// ===== COLORES =====
function renderColoresChips() {
  const chips = document.getElementById('coloresChips');
  if (!chips) return;
  chips.innerHTML = coloresData.length === 0
    ? `<span class="colores-vacio">Sin colores agregados</span>`
    : coloresData.map((c, i) => `
        <span class="color-chip">
          ${c}
          <button type="button" class="chip-del" data-i="${i}" title="Eliminar">×</button>
        </span>`).join('');

  chips.querySelectorAll('.chip-del').forEach(btn =>
    btn.addEventListener('click', () => {
      coloresData.splice(+btn.dataset.i, 1);
      renderColoresChips();
    })
  );
}

document.getElementById('btnAddColor').addEventListener('click', () => {
  const input = document.getElementById('nuevoColor');
  const val   = input.value.trim();
  if (!val) return;
  if (!coloresData.includes(val)) {
    coloresData.push(val);
    renderColoresChips();
  }
  input.value = '';
  input.focus();
});

document.getElementById('nuevoColor').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); document.getElementById('btnAddColor').click(); }
});

async function cargarColores(productoId) {
  try {
    const res  = await fetch(`${API_URL}/productos/${productoId}/colores`);
    const data = await res.json();
    coloresData = data.map(c => c.color);
  } catch(err) { coloresData = []; }
  renderColoresChips();
}

async function guardarColores(productoId) {
  const res = await fetch(`${API_URL}/productos/${productoId}/colores`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ colores: coloresData.map(c => ({ color: c })) })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Error al guardar colores');
  }
}

// ===== MODAL =====
btnAbrirModal.addEventListener("click", () => {
  editId = null;
  form.reset();
  resetUpload();
  variantesData = [];
  coloresData   = [];
  renderVariantesRows();
  renderColoresChips();
  modalTitle.textContent  = "Agregar Producto";
  btnGuardar.textContent  = "Guardar producto";
  modalOverlay.classList.add("active");
});

btnCerrarModal.addEventListener("click", cerrarModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) cerrarModal();
});

function cerrarModal() {
  modalOverlay.classList.remove("active");
  form.reset();
  resetUpload();
  variantesData = [];
  coloresData   = [];
  renderVariantesRows();
  renderColoresChips();
  editId = null;
}

// ===== FORMATO PRECIO =====
function formatPrecio(precio) {
  return "$" + Number(precio).toLocaleString("es-CL");
}

// ===== RENDER =====
function renderProductos() {
  if (productos.length === 0) {
    productList.innerHTML = `<div class="empty-state">No hay productos aún. ¡Agrega el primero!</div>`;
    return;
  }

  const iconEdit = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>`;

  const iconToggle = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>
    </svg>`;

  const iconTrash = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>`;

  const iconVenta = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>`;

  const iconUpload = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>`;

  productList.innerHTML = productos.map((prod) => `
    <div class="product-row${!prod.activo ? ' inactivo' : ''}">
      <div class="product-info">
        <div class="product-img-box">
          ${prod.imagen_url
            ? `<img src="${prod.imagen_url}" alt="${prod.nombre}" onerror="this.parentElement.innerHTML='${iconUpload}'">`
            : iconUpload
          }
        </div>
        <span class="product-name">
          ${prod.nombre}
          ${!prod.activo ? '<em class="badge-inactivo">inactivo</em>' : ''}
        </span>
      </div>
      <span class="product-category">${prod.categorias?.nombre || "—"}</span>
      <span class="product-price">${formatPrecio(prod.precio)}</span>
      <div class="product-actions">
        <button class="btn-edit"        onclick="abrirEditar('${prod.id}')"        title="Editar">${iconEdit}</button>
        <button class="btn-venta"       onclick="abrirRegistrarVenta('${prod.id}')" title="Registrar venta">${iconVenta}</button>
        <button class="btn-delete"      onclick="toggleProducto('${prod.id}')"     title="${prod.activo ? 'Desactivar' : 'Activar'}">${iconToggle}</button>
        <button class="btn-delete-hard" onclick="eliminarProducto('${prod.id}')"   title="Eliminar permanentemente">${iconTrash}</button>
      </div>
    </div>
  `).join("");
}

// ===== GUARDAR / ACTUALIZAR =====
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const precioBase = parseFloat(document.getElementById("precio").value) || 0;
  const tieneVariantes = variantesData.some(v => String(v.talla || '').trim());

  const payload = {
    nombre:       document.getElementById("nombre").value.trim(),
    descripcion:  document.getElementById("descripcion").value.trim(),
    precio:       precioBase,
    imagen_url:   imagenesUrls[0] || null,
    imagenes:     imagenesUrls,
    categoria_id: document.getElementById("categoria_id").value || null,
  };

  if (!payload.nombre || !payload.descripcion) {
    await alertar("Nombre y descripción son obligatorios.");
    return;
  }
  if (!tieneVariantes && !precioBase) {
    await alertar("Ingresa un precio base o agrega al menos una variante con precio.");
    return;
  }

  try {
    btnGuardar.disabled    = true;
    btnGuardar.textContent = "Guardando...";

    const url    = editId ? `${API_URL}/productos/${editId}` : `${API_URL}/productos`;
    const method = editId ? 'PUT' : 'POST';

    const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al guardar');

    // Guardar variantes y colores
    await guardarVariantes(data.id);
    await guardarColores(data.id);

    cerrarModal();
    await cargarProductos();
  } catch(err) {
    await alertar(err.message);
  } finally {
    btnGuardar.disabled    = false;
    btnGuardar.textContent = editId ? "Actualizar producto" : "Guardar producto";
  }
});

// ===== REGISTRAR VENTA =====
let ventaProdId       = null;
let ventaVariantes    = [];
let ventaColores      = [];
let ventaTallaActual  = null;

const modalVenta        = document.getElementById('modalVenta');
const ventaForm         = document.getElementById('ventaForm');
const btnCerrarModalVenta = document.getElementById('btnCerrarModalVenta');

btnCerrarModalVenta.addEventListener('click', () => modalVenta.classList.remove('active'));
modalVenta.addEventListener('click', e => { if (e.target === modalVenta) modalVenta.classList.remove('active'); });

async function abrirRegistrarVenta(id) {
  const prod = productos.find(p => String(p.id) === String(id));
  if (!prod) return;

  ventaProdId      = prod.id;
  ventaTallaActual = null;

  document.getElementById('ventaProductoNombre').textContent = prod.nombre;
  document.getElementById('ventaPrecio').value    = prod.precio || '';
  document.getElementById('ventaCantidad').value  = 1;
  document.getElementById('ventaNotas').value     = '';
  document.getElementById('ventaError').textContent = '';

  // Cargar variantes
  const tallaGroup = document.getElementById('ventaTallaGroup');
  const tallaBtns  = document.getElementById('ventaTallaBtns');
  tallaGroup.style.display = 'none';
  tallaBtns.innerHTML = '';

  try {
    const res = await fetch(`${API_URL}/productos/${prod.id}/variantes`);
    ventaVariantes = await res.json();
    if (ventaVariantes.length > 0) {
      tallaGroup.style.display = 'block';
      tallaBtns.innerHTML = ventaVariantes.map((v, i) =>
        `<button type="button" class="btn-variante-admin" data-i="${i}">
           ${v.talla} <span style="color:#aaa;font-size:0.75rem;margin-left:4px">$${Number(v.precio).toLocaleString('es-CL')} · Stock: ${v.stock}</span>
         </button>`
      ).join('');

      tallaBtns.querySelectorAll('.btn-variante-admin').forEach(btn => {
        btn.addEventListener('click', () => {
          tallaBtns.querySelectorAll('.btn-variante-admin').forEach(b => b.classList.remove('activo'));
          btn.classList.add('activo');
          const v = ventaVariantes[+btn.dataset.i];
          ventaTallaActual = v.talla;
          document.getElementById('ventaPrecio').value = v.precio;
        });
      });
    }
  } catch(e) { ventaVariantes = []; }

  // Cargar colores
  const colorGroup = document.getElementById('ventaColorGroup');
  const colorBtns  = document.getElementById('ventaColorBtns');
  colorGroup.style.display = 'none';
  colorBtns.innerHTML = '';

  try {
    const res = await fetch(`${API_URL}/productos/${prod.id}/colores`);
    ventaColores = await res.json();
    if (ventaColores.length > 0) {
      colorGroup.style.display = 'block';
      colorBtns.innerHTML = ventaColores.map((c, i) =>
        `<button type="button" class="btn-variante-admin" data-color="${c.color}">${c.color}</button>`
      ).join('');
      colorBtns.querySelectorAll('.btn-variante-admin').forEach(btn => {
        btn.addEventListener('click', () => {
          colorBtns.querySelectorAll('.btn-variante-admin').forEach(b => b.classList.remove('activo'));
          btn.classList.add('activo');
        });
      });
    }
  } catch(e) { ventaColores = []; }

  modalVenta.classList.add('active');
}

ventaForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('ventaError');
  errorEl.textContent = '';

  // Validar talla obligatoria si hay variantes
  const tallaSeleccionada = ventaTallaActual ||
    document.querySelector('#ventaTallaBtns .btn-variante-admin.activo')?.dataset
      ? document.querySelector('#ventaTallaBtns .btn-variante-admin.activo') ? ventaTallaActual : null
      : null;

  if (ventaVariantes.length > 0 && !ventaTallaActual) {
    errorEl.textContent = 'Selecciona una talla antes de registrar la venta.';
    return;
  }

  const colorActivo = document.querySelector('#ventaColorBtns .btn-variante-admin.activo');

  const precio   = parseFloat(document.getElementById('ventaPrecio').value);
  const cantidad = parseInt(document.getElementById('ventaCantidad').value, 10) || 1;

  if (!precio || precio <= 0) {
    errorEl.textContent = 'Ingresa un precio de venta válido.';
    return;
  }

  const payload = {
    producto_id: ventaProdId,
    talla:       ventaTallaActual || null,
    color:       colorActivo?.dataset.color || null,
    precio,
    cantidad,
    notas:       document.getElementById('ventaNotas').value.trim() || null
  };

  const btn = document.getElementById('btnGuardarVenta');
  btn.disabled = true;
  btn.textContent = 'Registrando...';

  try {
    const res = await fetch(`${API_URL}/ventas`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al registrar');

    modalVenta.classList.remove('active');
    await cargarProductos(); // refresca stock en la tabla
    await alertar(`✓ Venta registrada correctamente.\n${payload.talla ? `Talla: ${payload.talla}` : ''} ${payload.color ? `| Color: ${payload.color}` : ''}\nPrecio: $${precio.toLocaleString('es-CL')} × ${cantidad}`);
  } catch(err) {
    errorEl.textContent = err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Registrar venta';
  }
});

// ===== ELIMINAR PERMANENTE =====
async function eliminarProducto(id) {
  const prod = productos.find(p => String(p.id) === String(id));
  const ok   = await confirmar(
    `¿Eliminar "${prod?.nombre}" PERMANENTEMENTE?\n\nEsto borrará el producto, sus variantes y colores. Esta acción no se puede deshacer.`,
    'Eliminar definitivamente'
  );
  if (!ok) return;
  try {
    const res = await fetch(`${API_URL}/productos/${id}`, {
      method: 'DELETE',
      headers: headers()
    });
    if (!res.ok) throw new Error('Error al eliminar');
    await cargarProductos();
  } catch(err) {
    await alertar(err.message);
  }
}

// ===== EDITAR =====
function abrirEditar(id) {
  const prod = productos.find(p => String(p.id) === String(id));
  if (!prod) return;

  editId = id;
  modalTitle.textContent = "Editar Producto";
  btnGuardar.textContent = "Actualizar producto";

  document.getElementById("nombre").value       = prod.nombre;
  document.getElementById("categoria_id").value = prod.categorias?.id || "";
  document.getElementById("descripcion").value  = prod.descripcion || "";
  document.getElementById("precio").value       = prod.precio;

  // Cargar imágenes existentes
  imagenesUrls = prod.imagenes?.length ? [...prod.imagenes] : (prod.imagen_url ? [prod.imagen_url] : []);
  renderImagenesGrid();

  // Cargar variantes y colores existentes
  cargarVariantes(id);
  cargarColores(id);

  modalOverlay.classList.add("active");
}

// ===== TOGGLE ACTIVO/INACTIVO =====
async function toggleProducto(id) {
  const prod   = productos.find(p => p.id === id);
  const accion = prod?.activo ? 'desactivar' : 'activar';
  if (!await confirmar(`¿Deseas ${accion} "${prod?.nombre}"?`, accion.charAt(0).toUpperCase() + accion.slice(1))) return;

  try {
    const res = await fetch(`${API_URL}/productos/${id}/toggle`, {
      method: 'PATCH',
      headers: headers()
    });
    if (!res.ok) throw new Error('Error al cambiar estado');
    await cargarProductos();
  } catch(err) {
    await alertar(err.message);
  }
}

// ===== ARRANQUE =====
if (token && usuario) {
  mostrarPanel();
  if (refreshToken) agendarRefresh();
} else {
  mostrarLogin();
}
