const contedorProductos = document.getElementById("productos");
const inputBusqueda = document.getElementById("busqueda");
const contenedorCategorias = document.getElementById("categorias");

let productos = [];
let categoriaSeleccionada = "all";

async function cargarProductos() {
  try {
    const respuesta = await fetch("https://fakestoreapi.com/products");

    if (!respuesta.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    productos = await respuesta.json();

    if (productos.length === 0) {
      console.log("No hay productos disponibles");
    } else {
      mostrarProductos(productos);
    }
  } catch (error) {
    console.error("Error al cargar los productos:", error);
  }
}

async function cargarCategorias() {
  try {
    const respuesta = await fetch(
      "https://fakestoreapi.com/products/categories"
    );

    if (!respuesta.ok) {
      throw new Error("Error en la respuesta de la API");
    }
    const categorias = await respuesta.json();
    mostrarCategorias(["all", ...categorias]);
  } catch (error) {
    console.error("Error al cargar las categorías:", error);
  }
}

function filtrarProductos() {
  let filtrados = productos;

  //Filtrar por categoria
  if (categoriaSeleccionada !== "all") {
    filtrados = filtrados.filter((p) => p.category === categoriaSeleccionada);
  }

  const texto = inputBusqueda.value.toLowerCase();
  if (texto.trim() !== "") {
    filtrados = filtrados.filter(
      (p) =>
        p.title.toLowerCase().includes(texto) ||
        p.description.toLowerCase().includes(texto)
    );
  }

  mostrarProductos(filtrados);
}

function mostrarCategorias(categorias) {
  contenedorCategorias.innerHTML = ""; // Limpiar el contenedor antes de agregar nuevas categorías

  categorias.forEach((cat) => {
    const btn = document.createElement("button");

    btn.textContent =
      cat === "all" ? "Todos" : cat.charAt(0).toUpperCase() + cat.slice(1);
    btn.className = `px-4 py-2 rounded-full ${
      categoriaSeleccionada === cat
        ? "bg-blue-500 text-white"
        : "bg-blue-100 text-blue -500"
    }
     hover:bg-blue-500 hover:text-white transition-colors duration-300`;

    btn.addEventListener("click", () => {
      categoriaSeleccionada = cat;
      mostrarCategorias(categorias);
      filtrarProductos();
    });
    contenedorCategorias.appendChild(btn);
  });
}

function mostrarProductos(pepito) {
  contedorProductos.innerHTML = ""; // Limpiar el contenedor antes de agregar nuevos productos

  pepito.forEach((producto) => {
    const productoDiv = document.createElement("div");
    productoDiv.className =
      "bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:shadow-ld transition-shadow duration-300";

    productoDiv.innerHTML = `
        <img src="${producto.image}" alt="${producto.title}" class="w-32 h-32 object-contain mb-4">
        <h3 class="text-lg font-semibold mb-2 text-center">${producto.title}</h3>
      <p class="text-gray-600 mb-2">$${producto.price}</p>
      <button class="mt-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Agregar al carrito</button>
      `;

    contedorProductos.appendChild(productoDiv);
  });
}

inputBusqueda.addEventListener("input", filtrarProductos);

document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  cargarCategorias();
});
