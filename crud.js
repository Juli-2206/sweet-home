const API_URL = 'https://sweet-home-zw3h.onrender.com';

// ===== ESTADO =====
let token    = sessionStorage.getItem('sh_token');
let usuario  = null;
try { usuario = JSON.parse(sessionStorage.getItem('sh_usuario')); } catch(e) {}
let productos  = [];
let categorias = [];
let editId     = null;

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
const btnNuevaCat    = document.getElementById("btnNuevaCat");
const nuevaCatForm   = document.getElementById("nuevaCatForm");
const btnGuardarCat  = document.getElementById("btnGuardarCat");
const btnCancelarCat = document.getElementById("btnCancelarCat");

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

    token   = data.token;
    usuario = data.usuario;
    sessionStorage.setItem('sh_token', token);
    sessionStorage.setItem('sh_usuario', JSON.stringify(usuario));

    mostrarPanel();
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
  sessionStorage.removeItem('sh_usuario');
  token   = null;
  usuario = null;
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
  nuevaCatForm.classList.toggle('visible');
  if (nuevaCatForm.classList.contains('visible')) {
    document.getElementById('nuevaCatNombre').focus();
  }
});

btnCancelarCat.addEventListener('click', () => {
  nuevaCatForm.classList.remove('visible');
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
    document.getElementById('categoria_id').value = cat.id;

    nuevaCatForm.classList.remove('visible');
    document.getElementById('nuevaCatNombre').value = '';
  } catch(err) {
    alert(err.message);
  } finally {
    btnGuardarCat.disabled = false;
    btnGuardarCat.textContent = 'Agregar';
  }
});

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

// ===== MODAL =====
btnAbrirModal.addEventListener("click", () => {
  editId = null;
  form.reset();
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
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
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
        <button class="btn-edit"   onclick="abrirEditar('${prod.id}')"    title="Editar">${iconEdit}</button>
        <button class="btn-delete" onclick="toggleProducto('${prod.id}')" title="${prod.activo ? 'Desactivar' : 'Activar'}">${iconToggle}</button>
      </div>
    </div>
  `).join("");
}

// ===== GUARDAR / ACTUALIZAR =====
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    nombre:       document.getElementById("nombre").value.trim(),
    descripcion:  document.getElementById("descripcion").value.trim(),
    precio:       parseFloat(document.getElementById("precio").value),
    imagen_url:   document.getElementById("imagen").value.trim() || null,
    categoria_id: document.getElementById("categoria_id").value || null,
  };

  if (!payload.nombre || !payload.descripcion || !payload.precio) {
    alert("Nombre, descripción y precio son obligatorios.");
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

    cerrarModal();
    await cargarProductos();
  } catch(err) {
    alert(err.message);
  } finally {
    btnGuardar.disabled    = false;
    btnGuardar.textContent = editId ? "Actualizar producto" : "Guardar producto";
  }
});

// ===== EDITAR =====
function abrirEditar(id) {
  const prod = productos.find(p => p.id === id);
  if (!prod) return;

  editId = id;
  modalTitle.textContent = "Editar Producto";
  btnGuardar.textContent = "Actualizar producto";

  document.getElementById("nombre").value       = prod.nombre;
  document.getElementById("categoria_id").value = prod.categorias?.id || "";
  document.getElementById("descripcion").value  = prod.descripcion || "";
  document.getElementById("precio").value       = prod.precio;
  document.getElementById("imagen").value       = prod.imagen_url || "";

  modalOverlay.classList.add("active");
}

// ===== TOGGLE ACTIVO/INACTIVO =====
async function toggleProducto(id) {
  const prod   = productos.find(p => p.id === id);
  const accion = prod?.activo ? 'desactivar' : 'activar';
  if (!confirm(`¿Deseas ${accion} "${prod?.nombre}"?`)) return;

  try {
    const res = await fetch(`${API_URL}/productos/${id}/toggle`, {
      method: 'PATCH',
      headers: headers()
    });
    if (!res.ok) throw new Error('Error al cambiar estado');
    await cargarProductos();
  } catch(err) {
    alert(err.message);
  }
}

// ===== ARRANQUE =====
if (token && usuario) {
  mostrarPanel();
} else {
  mostrarLogin();
}
