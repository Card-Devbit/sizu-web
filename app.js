import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const NUMERO_WHATSAPP = "50500000000"; // Pon tu número de WhatsApp aquí

document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
});

async function cargarProductos() {
    const contenedor = document.getElementById("contenedor-productos");
    
    try {
        const querySnapshot = await getDocs(collection(db, "productos"));
        contenedor.innerHTML = ""; 

        if (querySnapshot.empty) {
            contenedor.innerHTML = `<p class="col-span-full text-center font-serif text-xl">Aún no hay tesoros disponibles. ¡Vuelve pronto!</p>`;
            return;
        }

        let hayProductos = false;
        querySnapshot.forEach((doc) => {
            const producto = doc.data();
            if (producto.estado !== "Vendido") {
                contenedor.innerHTML += crearTarjeta(producto);
                hayProductos = true;
            }
        });

        if (!hayProductos) {
            contenedor.innerHTML = `<p class="col-span-full text-center font-serif text-xl">Aún no hay tesoros disponibles. ¡Vuelve pronto!</p>`;
        }

    } catch (error) {
        console.error("Error al cargar Firebase:", error);
        contenedor.innerHTML = `<p class="col-span-full text-center text-red-500 font-serif">Error al conectar con el armario.</p>`;
    }
}

function crearTarjeta(producto) {
    // Cambio a Córdobas (C$)
    const precioFormat = `C$${parseFloat(producto.precio).toFixed(2)}`;
    const mensaje = `Hola, SIZU. Estoy interesada en la prenda: ${producto.nombre} de ${precioFormat}. ¿Todavía está disponible?`;
    const urlWa = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

    const etiqueta = producto.estado === "Reservado" 
        ? `<div class="absolute top-4 right-4 bg-yellow-100/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold tracking-wider text-yellow-800 border border-yellow-200">¡RESERVADO!</div>`
        : `<div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold tracking-wider text-sizu-maroon border border-sizu-maroon/20">¡ÚNICA PIEZA!</div>`;

    return `
        <div class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-soft transition-shadow duration-300 group">
            <div class="relative aspect-[3/4] overflow-hidden">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500">
                ${etiqueta}
            </div>
            <div class="p-6 text-center">
                <span class="text-xs text-gray-500 mb-1 block">Talla ${producto.talla}</span>
                <h3 class="font-serif text-xl font-semibold mb-2 truncate">${producto.nombre}</h3>
                <p class="font-semibold text-lg mb-4 text-sizu-dusty">${precioFormat}</p>
                <a href="${urlWa}" target="_blank" class="block w-full bg-sizu-maroon text-white font-medium py-2.5 rounded-full hover:bg-[#732a3d] transition-all">
                    ¡Lo quiero! <i class="fa-brands fa-whatsapp ml-2"></i>
                </a>
            </div>
        </div>
    `;
}