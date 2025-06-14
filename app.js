const contedorProductos = document.getElementById("productos");
const inputBusqueda = document.getElementById("busqueda");
const contenedorCategorias = document.getElementById("categorias");

let productos = [];
let categoriaSeleccionada = "all";

//LOGICA DE LOGIN
document.addEventListener("DOMContentLoaded", () => {
  // ✅ Obtener referencias a botones de login/logout
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout");

  // ✅ Verificar si hay token para mostrar u ocultar botones
  const token = localStorage.getItem("token");
  if (token) {
    if (loginBtn) loginBtn.classList.add("hidden");
    if (logoutBtn) logoutBtn.classList.remove("hidden");
  }

  // ✅ Evento para cerrar sesión
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "index.html";
    });
  }

  // ✅ Lógica de inicio de sesión
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const response = await fetch("http://127.0.0.1:8000/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          throw new Error("Error en la respuesta de la API");
        }

        const data = await response.json();

        // ✅ Guardar token y rol
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role", data.user.rol);

        const mensaje = document.getElementById("mensaje");
        mensaje.textContent = "Inicio de sesión exitoso";
        mensaje.classList.add("text-green-500");

        // ✅ Redirigir según rol
        if (data.user.rol === "admin") {
          window.location.href = "products.html";
        } else {
          window.location.href = "index.html";
        }

      } catch (error) {
        console.error("Error al iniciar sesión:", error);
        const mensaje = document.getElementById("mensaje");
        mensaje.textContent = "Error al iniciar sesión. Inténtalo de nuevo.";
        mensaje.classList.add("text-red-500");
      }
    });
  }

  // ✅ Cargar productos si estamos en catálogo
  if (contedorProductos && inputBusqueda && contenedorCategorias) {
    cargarProductos();
    cargarCategorias();
    inputBusqueda.addEventListener("input", filtrarProductos);
  }
});


//LOGICA DE PRODUCTOS
async function cargarProductos() {
  try {
    const respuesta = await fetch("http://127.0.0.1:8000/api/productos");

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
        : "bg-blue-100 text-blue-500"
    } font-semibold shadow transition hover:bg-blue-200`;

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
      "bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:shadow-xl transition-shadow duration-300";

    productoDiv.innerHTML = `
      
      <h3 class="text-lg font-semibold mb-2 text-center">${producto.titulo}</h3>
      <img src="${producto.imagen}" alt="${producto.titulo}" class="w-32 h-32 object-contain mb-4">
      <p class="text-gray-600 mb-2">$${producto.precio}</p>
      <a href="detalle.html?id=${producto.id}" class="mt-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-center">Ver detalle</a>
    `;

    contedorProductos.appendChild(productoDiv);
  });
}

// Detectar si estamos en la vista admin (products.html)
if (window.location.pathname.includes("products.html")) {
  document.addEventListener("DOMContentLoaded", () => {
    cargarProductosAdmin();
  });
}

// Función para mostrar productos en modo admin
async function cargarProductosAdmin() {
  try {
    const respuesta = await fetch("http://127.0.0.1:8000/api/productos");

    if (!respuesta.ok) {
      throw new Error("No se pudieron obtener los productos.");
    }

    const productos = await respuesta.json();
    const contenedor = document.getElementById("productos");
    contenedor.innerHTML = "";

    productos.forEach((producto) => {
      const div = document.createElement("div");
      div.className =
        "bg-white rounded-lg shadow-md p-4 flex flex-col hover:shadow-xl transition-shadow";

      div.innerHTML = `
        <h3 class="text-lg font-bold mb-2 text-center">${producto.titulo}</h3>
        <img src="${producto.imagen}" alt="${producto.titulo}" class="w-32 h-32 object-contain mx-auto mb-4" />
        <p class="text-gray-600 text-center mb-2">$${producto.precio}</p>
        <div class="flex justify-center gap-2 mt-auto">
          <button onclick="redirigirEditar(${producto.id})" class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm">Editar</button>
          <button onclick="eliminarProducto(${producto.id})" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Eliminar</button>
        </div>
      `;

      contenedor.appendChild(div);
    });
  } catch (error) {
    console.error("Error al mostrar productos admin:", error);
  }
}

// Redirigir al formulario de edición
window.redirigirEditar = function(id) {
  window.location.href = `editar.html?id=${id}`;
};

// Eliminar producto
window.eliminarProducto = async function(id) {
  if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

  const token = localStorage.getItem("token");

  try {
    const respuesta = await fetch(`http://127.0.0.1:8000/api/productos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!respuesta.ok) {
      throw new Error("Error al eliminar el producto");
    }

    alert("Producto eliminado correctamente.");
    cargarProductosAdmin(); // Recargar la lista
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    alert("Hubo un error al eliminar el producto.");
  }
};