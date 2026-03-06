
// ── Referencias al DOM 
const cajaCerrada   = document.getElementById("caja");
const cajaAbierta   = document.getElementById("caja-abierta");
const ganadorInfo   = document.getElementById("ganador-info");
const sorteoContenedor = document.getElementById("participantes-container");

// ── Animación principal 
// Se llama desde main.js cuando el usuario da click en "Sortear"
function animarSorteo(resultado) {
  if (!resultado) return;

  const participantes = Object.keys(resultado);

  // ── Resetear estado visual 
  sorteoContenedor.innerHTML  = "";
  cajaCerrada.classList.remove("hidden", "sacudiendo");
  cajaAbierta.classList.add("hidden");
  ganadorInfo.textContent     = "¡Los nombres están entrando a la caja!";

  // ── Fase 1: Nombres cayendo hacia la caja 
  participantes.forEach((nombre, index) => {
    const div       = document.createElement("div");
    div.className   = "participante absolute text-sm font-bold text-pink-600 bg-white px-2 py-1 rounded shadow";
    div.textContent = nombre;
    div.style.top   = "-50px";
    div.style.left  = `${30 + Math.random() * 40}%`;
    sorteoContenedor.appendChild(div);

    setTimeout(() => {
      div.style.transition = "top 1.2s ease, opacity 1.2s ease";
      div.style.top        = "calc(100% - 40px)";
      div.style.opacity    = "0";
    }, index * 300);
  });

  const tiempoCaida = participantes.length * 300 + 1200;

  // ── Fase 2: Sacudir la caja 
  setTimeout(() => {
    cajaCerrada.classList.add("sacudiendo");
    ganadorInfo.textContent = "🎲 Mezclando...";
  }, tiempoCaida);

  // ── Fase 3: Abrir la caja y mostrar resultados 
  setTimeout(() => {
    cajaCerrada.classList.add("hidden");
    cajaAbierta.classList.remove("hidden");

    lanzarConfeti();
    mostrarResultados(resultado);
  }, tiempoCaida + 1200);
}

// ── Mostrar tabla de resultados 
function mostrarResultados(resultado) {
  ganadorInfo.textContent = "🎉 ¡El sorteo está listo!";

  // Limpiar contenedor
  sorteoContenedor.innerHTML = "";

  // Crear tabla de resultados
  const tabla = document.createElement("div");
  tabla.className = "mt-4 w-full";

  Object.entries(resultado).forEach(([dador, receptor]) => {
    const fila = document.createElement("div");
    fila.className = "flex items-center justify-between bg-white rounded-xl px-4 py-2 mb-2 shadow text-sm";
    fila.innerHTML = `
      <span class="font-semibold text-gray-700">${dador}</span>
      <span class="text-pink-400 text-lg">🎁</span>
      <span class="font-semibold text-pink-600">${receptor}</span>
    `;
    tabla.appendChild(fila);
  });

  sorteoContenedor.appendChild(tabla);
}

// ── Confeti
function lanzarConfeti() {
  const colores = ["#FF0000", "#00FF00", "#0000FF", "#FFD700", "#FF69B4", "#00CED1"];

  for (let i = 0; i < 60; i++) {
    const confeti       = document.createElement("div");
    confeti.className   = "confeti-piece";
    confeti.style.setProperty("--color", colores[Math.floor(Math.random() * colores.length)]);
    confeti.style.setProperty("--x", (Math.random() * 200 - 100) + "px");
    confeti.style.left  = Math.random() * 100 + "%";
    sorteoContenedor.appendChild(confeti);

    setTimeout(() => confeti.remove(), 2500);
  }
}