const form = document.getElementById("productForm");
const productList = document.getElementById("productList");

let productos = JSON.parse(localStorage.getItem("productos")) || [];

// Mostrar productos
function renderProductos() {
  productList.innerHTML = "";

  productos.forEach((prod, index) => {
    productList.innerHTML += `
      <div class="product">
        <img src="${prod.imagen}" width="100%">
        <h3>${prod.nombre}</h3>
        <p>${prod.descripcion}</p>
        <p><strong>$${prod.precio}</strong></p>
        <button onclick="eliminarProducto(${index})">Eliminar</button>
      </div>
    `;
  });
}

// Guardar producto
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nuevoProducto = {
    nombre: document.getElementById("nombre").value,
    descripcion: document.getElementById("descripcion").value,
    precio: document.getElementById("precio").value,
    imagen: document.getElementById("imagen").value
  };

  productos.push(nuevoProducto);
  localStorage.setItem("productos", JSON.stringify(productos));

  form.reset();
  renderProductos();
});

// Eliminar producto
function eliminarProducto(index) {
  productos.splice(index, 1);
  localStorage.setItem("productos", JSON.stringify(productos));
  renderProductos();
}

// Inicializar
renderProductos();