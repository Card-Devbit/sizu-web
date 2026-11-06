import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, addDoc, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const loginSection = document.getElementById('login-section');
const adminSection = document.getElementById('admin-section');
const formLogin = document.getElementById('form-login');
const formProducto = document.getElementById('form-producto');
const btnLogout = document.getElementById('btn-logout');
const mensajeSistema = document.getElementById('mensaje-sistema');
const listaInventario = document.getElementById('lista-inventario');

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

formProducto.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnGuardar = document.getElementById('btn-guardar');
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Subiendo...';
    mensajeSistema.classList.add('hidden');

    try {
        await addDoc(collection(db, "productos"), {
            nombre: document.getElementById('nombre').value,
            categoria: document.getElementById('categoria').value,
            precio: parseFloat(document.getElementById('precio').value),
            talla: document.getElementById('talla').value,
            imagen: document.getElementById('imagen').value,
            estado: document.getElementById('estado').value,
            fecha: new Date().toISOString()
        });

        mensajeSistema.className = "text-center text-sm font-medium py-2 rounded-lg mt-4 bg-green-100 text-green-800";
        mensajeSistema.innerText = "¡Prenda publicada exitosamente!";
        mensajeSistema.classList.remove('hidden');
        formProducto.reset(); 
        
        cargarInventario(); 

    } catch (error) {
        console.error(error);
        mensajeSistema.className = "text-center text-sm font-medium py-2 rounded-lg mt-4 bg-red-100 text-red-800";
        mensajeSistema.innerText = "Error. Revisa tu conexión.";
        mensajeSistema.classList.remove('hidden');
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = '<i class="fa-solid fa-cloud-arrow-up mr-2"></i> Subir Prenda';
    }
});

async function cargarInventario() {
    listaInventario.innerHTML = '<p class="text-sm text-gray-500 text-center py-4"><i class="fa-solid fa-spinner fa-spin"></i> Cargando...</p>';
    try {
        const querySnapshot = await getDocs(collection(db, "productos"));
        listaInventario.innerHTML = ""; 

        if (querySnapshot.empty) {
            listaInventario.innerHTML = `<p class="text-sm text-gray-500 text-center py-4">Tu armario está vacío.</p>`;
            return;
        }

        querySnapshot.forEach((doc) => {
            const prod = doc.data();
            const id = doc.id; 
            
            // Refleja moneda en Córdobas (C$) en la vista del administrador
            listaInventario.innerHTML += `
                <div class="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <div class="flex items-center gap-3 overflow-hidden">
                        <img src="${prod.imagen}" class="w-12 h-12 object-cover rounded-lg border border-gray-300">
                        <div>
                            <p class="font-bold text-sm text-gray-800 truncate w-32">${prod.nombre}</p>
                            <p class="text-xs text-sizu-dusty font-medium">C$${prod.precio} - ${prod.estado}</p>
                        </div>
                    </div>
                    <button data-id="${id}" class="btn-eliminar bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
        });
    } catch (error) {
        listaInventario.innerHTML = `<p class="text-sm text-red-500 text-center py-4">Error cargando inventario.</p>`;
    }
}

listaInventario.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-eliminar');
    if (btn) {
        const confirmar = confirm("¿Estás segura de que quieres eliminar esta prenda de la tienda? Esta acción no se puede deshacer.");
        if (confirmar) {
            const idProducto = btn.dataset.id;
            try {
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                await deleteDoc(doc(db, "productos", idProducto));
                cargarInventario();
            } catch (error) {
                alert("Hubo un error al eliminar. Intenta de nuevo.");
            }
        }
    }
});