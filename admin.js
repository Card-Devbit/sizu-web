import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const loginSection = document.getElementById('login-section');
const adminSection = document.getElementById('admin-section');
const formLogin = document.getElementById('form-login');
const formProducto = document.getElementById('form-producto');
const btnLogout = document.getElementById('btn-logout');
const mensajeSistema = document.getElementById('mensaje-sistema');

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.classList.add('hidden');
        adminSection.classList.remove('hidden');
    } else {
        loginSection.classList.remove('hidden');
        adminSection.classList.add('hidden');
    }
});

formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    try {
        errorDiv.classList.add('hidden');
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        errorDiv.classList.remove('hidden');
        errorDiv.innerText = "Credenciales incorrectas. Intenta de nuevo.";
    }
});

btnLogout.addEventListener('click', async () => {
    await signOut(auth);
});

formProducto.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnGuardar = document.getElementById('btn-guardar');
    
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Guardando...';
    mensajeSistema.classList.add('hidden');

    try {
        const nuevoProducto = {
            nombre: document.getElementById('nombre').value,
            categoria: document.getElementById('categoria').value,
            precio: parseFloat(document.getElementById('precio').value),
            talla: document.getElementById('talla').value,
            imagen: document.getElementById('imagen').value,
            estado: document.getElementById('estado').value,
            fecha: new Date().toISOString()
        };

        await addDoc(collection(db, "productos"), nuevoProducto);

        mensajeSistema.classList.remove('hidden');
        mensajeSistema.className = "text-center text-sm font-medium py-2 rounded-lg mt-4 bg-green-100 text-green-800";
        mensajeSistema.innerText = "¡Prenda guardada en Firebase exitosamente!";
        formProducto.reset(); 

    } catch (error) {
        console.error("Error guardando:", error);
        mensajeSistema.classList.remove('hidden');
        mensajeSistema.className = "text-center text-sm font-medium py-2 rounded-lg mt-4 bg-red-100 text-red-800";
        mensajeSistema.innerText = "Hubo un error al guardar. Revisa tu conexión.";
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = '<i class="fa-solid fa-cloud-arrow-up mr-2"></i> Subir Prenda';
    }
});