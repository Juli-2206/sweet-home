const form = document.getElementById("productForm");
const productList = document.getElementById("productList");
const btnGuardar = document.getElementById("btnGuardar");
const btnAbrirModal = document.getElementById("btnAbrirModal");
const btnCerrarModal = document.getElementById("btnCerrarModal");
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");

let productos = JSON.parse(localStorage.getItem("productos")) || [];
let editIndex = null;

// ===== MODAL =====
btnAbrirModal.addEventListener("click", () => {
  editIndex = null;
  form.reset();
  modalTitle.textContent = "Agregar Producto";
  btnGuardar.textContent = "Guardar producto";
  modalOverlay.classList.add("active");
});

btnCerrarModal.addEventListener("click", cerrarModal);

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) cerrarModal();
});

function cerrarModal() {
  modalOverlay.classList.remove("active");
  form.reset();
  editIndex = null;
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

  const iconUpload = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>`;

  const iconEdit = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>`;

  const iconDelete = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>`;

  productList.innerHTML = productos.map((prod, index) => `
    <div class="product-row">
      <div class="product-info">
        <div class="product-img-box">
          ${prod.imagen
            ? `<img src="${prod.imagen}" alt="${prod.nombre}" onerror="this.parentElement.innerHTML='${iconUpload}'">`
            : iconUpload
          }
        </div>
        <span class="product-name">${prod.nombre}</span>
      </div>
      <span class="product-category">${prod.categoria || "—"}</span>
      <span class="product-price">${formatPrecio(prod.precio)}</span>
      <div class="product-actions">
        <button class="btn-edit" onclick="editarProducto(${index})" title="Editar">${iconEdit}</button>
        <button class="btn-delete" onclick="eliminarProducto(${index})" title="Eliminar">${iconDelete}</button>
      </div>
    </div>
  `).join("");
}

// ===== GUARDAR / ACTUALIZAR =====
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const producto = {
    nombre: document.getElementById("nombre").value.trim(),
    categoria: document.getElementById("categoria").value.trim(),
    descripcion: document.getElementById("descripcion").value.trim(),
    precio: parseFloat(document.getElementById("precio").value),
    imagen: document.getElementById("imagen").value.trim()
  };

  if (!producto.nombre || !producto.descripcion || !producto.precio) {
    alert("Nombre, descripción y precio son obligatorios.");
    return;
  }

  if (editIndex === null) {
    productos.push(producto);
  } else {
    productos[editIndex] = producto;
    editIndex = null;
  }

  localStorage.setItem("productos", JSON.stringify(productos));
  cerrarModal();
  renderProductos();
});

// ===== EDITAR =====
function editarProducto(index) {
  const prod = productos[index];
  editIndex = index;
  modalTitle.textContent = "Editar Producto";
  btnGuardar.textContent = "Actualizar producto";

  document.getElementById("nombre").value = prod.nombre;
  document.getElementById("categoria").value = prod.categoria || "";
  document.getElementById("descripcion").value = prod.descripcion;
  document.getElementById("precio").value = prod.precio;
  document.getElementById("imagen").value = prod.imagen || "";

  modalOverlay.classList.add("active");
}

// ===== ELIMINAR =====
function eliminarProducto(index) {
  if (confirm("¿Seguro que quieres eliminar este producto?")) {
    productos.splice(index, 1);
    localStorage.setItem("productos", JSON.stringify(productos));
    renderProductos();
  }
}

// ===== INIT =====
renderProductos();
