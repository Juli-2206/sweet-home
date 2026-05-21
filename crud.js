const form = document.getElementById("productForm");
const productList = document.getElementById("productList");
const btnGuardar = document.getElementById("btnGuardar");
const inputNombre = document.getElementById("nombre");

let productos = JSON.parse(localStorage.getItem("productos")) || [];
let editIndex = null; // ← clave para saber si estamos editando

// Mostrar productos
function renderProductos() {
productList.innerHTML = productos.map((prod, index) => `
  <div class="product">
    <img src="${prod.imagen}" width="100%">  onerror="this.src='https://via.placeholder.com/150'">
    <h3>${prod.nombre}</h3>
    <p>${prod.descripcion}</p>
    <p><strong>$${prod.precio}</strong></p>
    <button onclick="editarProducto(${index})">Editar</button>
    <button onclick="eliminarProducto(${index})">Eliminar</button>
  </div>
`).join("");
}

// Guardar o actualizar producto
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const producto = {
    nombre: document.getElementById("nombre").value,
    descripcion: document.getElementById("descripcion").value,
    precio: parseFloat(document.getElementById("precio").value),
    imagen: document.getElementById("imagen").value
  };

if (!producto.nombre || !producto.descripcion || !producto.precio || !producto.imagen) {
  alert("Todos los campos son obligatorios");
  return;
}
  if (editIndex === null) {
    // CREATE
    productos.push(producto);
  } else {
    // UPDATE
    productos[editIndex] = producto;
    editIndex = null;
  }

  localStorage.setItem("productos", JSON.stringify(productos));

  form.reset();
  renderProductos();
  btnGuardar.textContent = "Guardar producto";
});

// Editar producto
function editarProducto(index) {
  const prod = productos[index];
  btnGuardar.textContent = "Actualizar producto";

  document.getElementById("nombre").value = prod.nombre;
  document.getElementById("descripcion").value = prod.descripcion;
  document.getElementById("precio").value = prod.precio;
  document.getElementById("imagen").value = prod.imagen;

  editIndex = index;
}

// Eliminar producto
function eliminarProducto(index) {
  if (confirm("¿Seguro que quieres eliminar este producto?")) {
    productos.splice(index, 1);
    localStorage.setItem("productos", JSON.stringify(productos));
    renderProductos();
  }
}
// Inicializar
renderProductos();
