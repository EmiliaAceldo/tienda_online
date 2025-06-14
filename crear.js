const API_BASE = "http://127.0.0.1:8000/api";
const token = localStorage.getItem("token");

const form = document.getElementById("formCrear");
const mensaje = document.getElementById("mensaje");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value;
  const descripcion = document.getElementById("descripcion").value;
  const precio = parseFloat(document.getElementById("precio").value);
  const stock = parseInt(document.getElementById("stock").value);
  const categorias = document.getElementById("categorias").value
    .split(",")
    .map((id) => parseInt(id.trim()))
    .filter((id) => !isNaN(id));

  const archivo = document.getElementById("imagen").files[0];
  let imageUrl = "";

  // Subir imagen a Firebase
  if (archivo) {
    try {
      const storageRef = firebase.storage().ref();
      const imageRef = storageRef.child(`productos/${Date.now()}-${archivo.name}`);
      const snapshot = await imageRef.put(archivo);
      imageUrl = await snapshot.ref.getDownloadURL();
    } catch (error) {
      console.error("Error al subir imagen a Firebase:", error);
      mensaje.textContent = "Error al subir la imagen.";
      mensaje.classList.add("text-red-500");
      return;
    }
  } else {
    mensaje.textContent = "Por favor selecciona una imagen.";
    mensaje.classList.add("text-red-500");
    return;
  }

  // Crear objeto para enviar al backend
  const datos = {
    titulo,
    descripcion,
    precio,
    imagen: imageUrl,
    stock,
    categorias,
  };

  try {
    const response = await fetch(`${API_BASE}/productos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
    });

    if (!response.ok) {
      const res = await response.json();
      throw new Error(res.message || "Error al crear el producto");
    }

    mensaje.textContent = "Producto creado correctamente.";
    mensaje.classList.remove("text-red-500");
    mensaje.classList.add("text-green-500");
    form.reset();

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

// Logout
const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "index.html";
  });
}
