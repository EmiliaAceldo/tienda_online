const API_BASE = "http://127.0.0.1:8000/api";
const token = localStorage.getItem("token");

const id = new URLSearchParams(window.location.search).get("id");
const form = document.getElementById("formEditar");
const mensaje = document.getElementById("mensaje");

// 1. Cargar los datos del producto
async function cargarProducto() {
  try {
    const response = await fetch(`${API_BASE}/productos/${id}`);
    if (!response.ok) throw new Error("Error al cargar el producto");

    const producto = await response.json();

    document.getElementById("productoId").value = producto.id;
    document.getElementById("titulo").value = producto.titulo;
    document.getElementById("descripcion").value = producto.descripcion;
    document.getElementById("precio").value = producto.precio;
    document.getElementById("imagenActual").src = producto.imagen || "";
    document.getElementById("stock").value = producto.stock;
    document.getElementById("categorias").value = (producto.categorias || [])
      .map((c) => c.id)
      .join(",");
  } catch (error) {
    console.error(error);
    mensaje.textContent = "Error al cargar el producto.";
    mensaje.classList.add("text-red-500");
  }
}

// 2. Guardar cambios
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value;
  const descripcion = document.getElementById("descripcion").value;
  const precio = parseFloat(document.getElementById("precio").value);
  const stock = parseInt(document.getElementById("stock").value);
  const categorias = document
    .getElementById("categorias")
    .value.split(",")
    .map((id) => parseInt(id.trim()))
    .filter((id) => !isNaN(id));

  let nuevaImagenUrl = null;
  const archivo = document.getElementById("imagen").files[0];

  // 2.1 Subir nueva imagen solo si el usuario seleccionó una
  if (archivo) {
    try {
      const storageRef = firebase.storage().ref();
      const imageRef = storageRef.child(`productos/${Date.now()}-${archivo.name}`);
      const snapshot = await imageRef.put(archivo);
      nuevaImagenUrl = await snapshot.ref.getDownloadURL();
    } catch (error) {
      console.error("Error al subir imagen a Firebase:", error);
      mensaje.textContent = "Error al subir la imagen.";
      mensaje.classList.add("text-red-500");
      return;
    }
  }

  const datos = {
    titulo,
    descripcion,
    precio,
    stock,
    categorias,
  };

  if (nuevaImagenUrl) {
    datos.imagen = nuevaImagenUrl;
  }

  // 2.2 Hacer PUT al backend
  try {
    const response = await fetch(`${API_BASE}/productos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
    });

    if (!response.ok) {
      const res = await response.json();
      throw new Error(res.message || "Error al actualizar el producto");
    }

    mensaje.textContent = "Producto actualizado correctamente.";
    mensaje.classList.remove("text-red-500");
    mensaje.classList.add("text-green-500");

    setTimeout(() => {
      window.location.href = "products.html";
    }, 1500);
  } catch (error) {
    console.error(error);
    mensaje.textContent = error.message;
    mensaje.classList.remove("text-green-500");
    mensaje.classList.add("text-red-500");
  }
});

// 3. Logout
const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "index.html";
  });
}

// Ejecutar
cargarProducto();
