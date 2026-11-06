import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
// SE AGREGÓ updateDoc A LAS HERRAMIENTAS
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const loginSection = document.getElementById('login-section');
const adminSection = document.getElementById('admin-section');
const formLogin = document.getElementById('form-login');
const formProducto = document.getElementById('form-producto');
const btnLogout = document.getElementById('btn-logout');
const mensajeSistema = document.getElementById('mensaje-sistema');
const listaInventario = document.getElementById('lista-inventario');
const btnCancelar = document.getElementById('btn-cancelar');
const btnGuardar = document.getElementById('btn-guardar');
const tituloFormulario = document.getElementById('titulo-formulario');

// Variables para el modo edición
let editandoId = null;
let productosMemoria = []; // Guardaremos la ropa aquí para cargarla rápido al editar

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.classList.add('hidden');
        adminSection.classList.remove('hidden');
        cargarInventario(); 
    } else {
        loginSection.classList.remove('hidden');
        adminSection.classList.add('hidden');
    }
});

formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        document.getElementById('login-error').classList.add('hidden');
        await signInWithEmailAndPassword(auth, document.getElementById('login-email').value, document.getElementById('login-password').value);
    } catch (error) {
        document.getElementById('login-error').classList.remove('hidden');
        document.getElementById('login-error').innerText = "Credenciales incorrectas.";
    }
});

btnLogout.addEventListener('click', async () => await signOut(auth));

// Botón para cancelar la edición
btnCancelar.addEventListener('click', () => {
    resetearFormulario();
});

// Guardar o Actualizar Prenda
formProducto.addEventListener('submit', async (e) => {
    e.preventDefault();
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Procesando...';
    mensajeSistema.classList.add('hidden');

    const datosPrenda = {
        nombre: document.getElementById('nombre').value,
        categoria: document.getElementById('categoria').value,
        precio: parseFloat(document.getElementById('precio').value),
        talla: document.getElementById('talla').value,
        imagen: document.getElementById('imagen').value,
        estado: document.getElementById('estado').value
    };

    try {
        if (editandoId) {
            // ACTUALIZAR PRENDA EXISTENTE
            await updateDoc(doc(db, "productos", editandoId), datosPrenda);
            mensajeSistema.innerText = "¡Prenda actualizada exitosamente!";
        } else {
            // CREAR PRENDA NUEVA
            datosPrenda.fecha = new Date().toISOString();
            await addDoc(collection(db, "productos"), datosPrenda);
            mensajeSistema.innerText = "¡Prenda publicada exitosamente!";
        }

        mensajeSistema.className = "text-center text-sm font-medium py-2 rounded-lg mt-4 bg-green-100 text-green-800";
        mensajeSistema.classList.remove('hidden');
        
        resetearFormulario();
        cargarInventario(); 

    } catch (error) {
        console.error(error);
        mensajeSistema.className = "text-center text-sm font-medium py-2 rounded-lg mt-4 bg-red-100 text-red-800";
        mensajeSistema.innerText = "Error. Revisa tu conexión.";
        mensajeSistema.classList.remove('hidden');
        restaurarBoton();
    }
});

async function cargarInventario() {
    listaInventario.innerHTML = '<p class="text-sm text-gray-500 text-center py-4"><i class="fa-solid fa-spinner fa-spin"></i> Cargando...</p>';
    try {
        const querySnapshot = await getDocs(collection(db, "productos"));
        listaInventario.innerHTML = ""; 
        productosMemoria = []; // Limpiamos la memoria

        if (querySnapshot.empty) {
            listaInventario.innerHTML = `<p class="text-sm text-gray-500 text-center py-4">Tu armario está vacío.</p>`;
            return;
        }

        querySnapshot.forEach((doc) => {
            const prod = doc.data();
            const id = doc.id; 
            
            // Guardamos la prenda en la memoria local
            productosMemoria.push({ id, ...prod });

            listaInventario.innerHTML += `
                <div class="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <div class="flex items-center gap-3 overflow-hidden">
                        <img src="${prod.imagen}" class="w-12 h-12 object-cover rounded-lg border border-gray-300">
                        <div>
                            <p class="font-bold text-sm text-gray-800 truncate w-24 sm:w-32">${prod.nombre}</p>
                            <p class="text-xs text-sizu-dusty font-medium">C$${prod.precio} - ${prod.estado}</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <!-- Botón de Editar -->
                        <button data-id="${id}" class="btn-editar bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-colors" title="Editar">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <!-- Botón de Eliminar -->
                        <button data-id="${id}" class="btn-eliminar bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors" title="Eliminar">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        listaInventario.innerHTML = `<p class="text-sm text-red-500 text-center py-4">Error cargando inventario.</p>`;
    }
}

// Escuchar clics en Editar o Eliminar
listaInventario.addEventListener('click', async (e) => {
    const btnEliminar = e.target.closest('.btn-eliminar');
    const btnEditar = e.target.closest('.btn-editar');

    if (btnEliminar) {
        const confirmar = confirm("¿Estás segura de que quieres eliminar esta prenda de la tienda?");
        if (confirmar) {
            try {
                btnEliminar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                await deleteDoc(doc(db, "productos", btnEliminar.dataset.id));
                
                // Si eliminamos lo que estamos editando, limpiamos el formulario
                if(editandoId === btnEliminar.dataset.id) resetearFormulario();
                
                cargarInventario();
            } catch (error) {
                alert("Hubo un error al eliminar. Intenta de nuevo.");
            }
        }
    }

    if (btnEditar) {
        const id = btnEditar.dataset.id;
        const producto = productosMemoria.find(p => p.id === id);
        
        if (producto) {
            // Subimos los datos al formulario
            document.getElementById('nombre').value = producto.nombre;
            document.getElementById('categoria').value = producto.categoria;
            document.getElementById('precio').value = producto.precio;
            document.getElementById('talla').value = producto.talla;
            document.getElementById('imagen').value = producto.imagen;
            document.getElementById('estado').value = producto.estado;

            // Cambiamos el modo a Edición
            editandoId = id;
            tituloFormulario.innerHTML = '<i class="fa-solid fa-pen mr-2"></i>Editando Prenda';
            btnGuardar.innerHTML = '<i class="fa-solid fa-floppy-disk mr-2"></i> Actualizar';
            btnGuardar.classList.replace('bg-sizu-maroon', 'bg-blue-600');
            btnGuardar.classList.replace('hover:bg-[#732a3d]', 'hover:bg-blue-700');
            btnCancelar.classList.remove('hidden');
            
            // Subimos la pantalla hacia el formulario
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
});

// Funciones de ayuda
function resetearFormulario() {
    editandoId = null;
    formProducto.reset();
    tituloFormulario.innerHTML = '<i class="fa-solid fa-plus mr-2"></i>Nueva Prenda';
    btnCancelar.classList.add('hidden');
    restaurarBoton();
}

function restaurarBoton() {
    btnGuardar.disabled = false;
    if (editandoId) {
        btnGuardar.innerHTML = '<i class="fa-solid fa-floppy-disk mr-2"></i> Actualizar';
    } else {
        btnGuardar.innerHTML = '<i class="fa-solid fa-cloud-arrow-up mr-2"></i> Subir Prenda';
        btnGuardar.classList.replace('bg-blue-600', 'bg-sizu-maroon');
        btnGuardar.classList.replace('hover:bg-blue-700', 'hover:bg-[#732a3d]');
    }
}