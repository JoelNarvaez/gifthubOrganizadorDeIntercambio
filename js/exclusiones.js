
const modalExclusiones    = document.getElementById("modal-exclusiones");
const tituloModal         = document.getElementById("titulo-modal");
const listaArrastrable    = document.getElementById("lista-arrastrable");
const zonaExclusion       = document.getElementById("zona-exclusion");
const exclusionesActuales = document.getElementById("exclusiones-actuales");
const contenedorPaso5     = document.getElementById("lista-exclusiones");

// Solo se usa mientras el modal está abierto
let exclusionesTemp = {};

function resetearExclusiones() {
  exclusionesTemp = {};
}
let personaEnModal  = "";

// Lee los participantes desde localStorage y renderiza la lista
function renderizarPaso5() {
  const id           = leerEventoActivo();
  const participantes = leerCampo(id, "participantes") || [];
  const exclusiones   = leerCampo(id, "exclusiones")   || {};

  // Copiar exclusiones actuales al estado temporal
  exclusionesTemp = JSON.parse(JSON.stringify(exclusiones));

  contenedorPaso5.innerHTML = "";

  participantes.forEach(nombre => {
    const excluidos = exclusionesTemp[nombre] || [];

    const item = document.createElement("div");
    item.className = "bg-white p-3 rounded-lg shadow flex justify-between items-center mb-2";

    item.innerHTML = `
      <div class="flex flex-col">
        <span class="font-medium">${nombre}</span>
        <span class="text-xs text-gray-400" id="resumen-${nombre}">
          ${excluidos.length > 0 ? "Excluye a: " + excluidos.join(", ") : "Sin exclusiones"}
        </span>
      </div>
      <button 
        class="bg-pink-500 text-white px-3 py-1 rounded text-sm"
        onclick="abrirModal('${nombre}')">
        Configurar
      </button>
    `;

    contenedorPaso5.appendChild(item);
  });
}

// Actualiza el resumen visible debajo del nombre (sin reabrir modal)
function actualizarResumen(nombre) {
  const span     = document.getElementById(`resumen-${nombre}`);
  const excluidos = exclusionesTemp[nombre] || [];
  if (!span) return;
  span.textContent = excluidos.length > 0
    ? "Excluye a: " + excluidos.join(", ")
    : "Sin exclusiones";
}


function abrirModal(nombre) {
  personaEnModal           = nombre;
  tituloModal.textContent  = `${nombre} no sortea a...`;
  zonaExclusion.dataset.nombre = nombre;

  renderizarListaArrastrable(nombre);
  renderizarExclusionesActuales(nombre);

  modalExclusiones.classList.remove("hidden");
}

function cerrarModal() {
  modalExclusiones.classList.add("hidden");
  personaEnModal = "";
}

// Renderiza los participantes disponibles para arrastrar
// (excluye a la persona misma y a los que ya están excluidos)
function renderizarListaArrastrable(nombre) {
  const id            = leerEventoActivo();
  const participantes  = leerCampo(id, "participantes") || [];
  const yaExcluidos   = exclusionesTemp[nombre] || [];

  listaArrastrable.innerHTML = "";

  const disponibles = participantes.filter(
    p => p !== nombre && !yaExcluidos.includes(p)
  );

  disponibles.forEach(participante => {
    const item = document.createElement("div");
    item.textContent = participante;
    item.draggable   = true;
    item.className   = "bg-pink-100 text-pink-700 px-3 py-2 rounded-lg cursor-move text-center";

    item.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", participante);
    });

    listaArrastrable.appendChild(item);
  });
}

// Renderiza las exclusiones ya aplicadas dentro del modal
function renderizarExclusionesActuales(nombre) {
  exclusionesActuales.innerHTML = "";
  const lista = exclusionesTemp[nombre] || [];

  if (lista.length === 0) {
    exclusionesActuales.innerHTML = "<p class='text-sm text-gray-400'>Sin exclusiones aún.</p>";
    return;
  }

  lista.forEach(p => {
    const tag = document.createElement("div");
    tag.className = "flex items-center justify-between bg-gray-100 px-3 py-1 rounded mb-1 text-sm";
    tag.innerHTML = `
      <span>❌ ${p}</span>
      <button class="text-gray-400 hover:text-red-500 ml-2" onclick="quitarExclusion('${nombre}','${p}')">✕</button>
    `;
    exclusionesActuales.appendChild(tag);
  });
}

// Quita una exclusión ya aplicada
function quitarExclusion(nombre, excluido) {
  exclusionesTemp[nombre] = (exclusionesTemp[nombre] || []).filter(p => p !== excluido);
  renderizarListaArrastrable(nombre);
  renderizarExclusionesActuales(nombre);
}

// ── Drag & Drop sobre la zona

zonaExclusion.addEventListener("dragover", (e) => {
  e.preventDefault();
  zonaExclusion.classList.add("bg-pink-100");
});

zonaExclusion.addEventListener("dragleave", () => {
  zonaExclusion.classList.remove("bg-pink-100");
});

zonaExclusion.addEventListener("drop", (e) => {
  e.preventDefault();
  zonaExclusion.classList.remove("bg-pink-100");

  const participante = e.dataTransfer.getData("text/plain");
  const nombre       = zonaExclusion.dataset.nombre;

  if (!exclusionesTemp[nombre]) exclusionesTemp[nombre] = [];

  if (!exclusionesTemp[nombre].includes(participante)) {
    exclusionesTemp[nombre].push(participante);
  }

  renderizarListaArrastrable(nombre);
  renderizarExclusionesActuales(nombre);
});

// ── Guardar exclusiones en localStorage ─────────────────────

// Se llama desde el botón "Guardar" del modal
function guardarExclusionesModal() {
  const id = leerEventoActivo();
  actualizarCampo(id, "exclusiones", exclusionesTemp);
  actualizarResumen(personaEnModal);
  cerrarModal();
}

function guardarExclusiones() {
  const id = leerEventoActivo();
  actualizarCampo(id, "exclusiones", exclusionesTemp);
}