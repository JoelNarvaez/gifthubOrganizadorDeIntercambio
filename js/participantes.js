
// ── Referencias al DOM ───────────────────────────────────────
const inputOrganizador    = document.getElementById("nombre-organizador");
const checkboxIncluir     = document.getElementById("incluirOrganizador");
const organizadorItem     = document.getElementById("organizador-item");
const organizadorInput    = document.getElementById("organizador-nombre");
const estadoIcono         = document.getElementById("organizador-estado");
const btnAgregar          = document.getElementById("btn-agregar");
const inputNuevo          = document.getElementById("nuevo-participante");
const listaParticipantes  = document.getElementById("lista-participantes");

// ── Paso 2: Organizador 

// Actualiza visualmente el item del organizador en el paso 3
function actualizarOrganizador() {
  const incluir = checkboxIncluir.checked;
  organizadorInput.value = inputOrganizador.value;

  if (incluir) {
    organizadorItem.classList.replace("bg-gray-100", "bg-gray-200");
    organizadorInput.disabled = false;
    organizadorInput.classList.remove("text-gray-400");
    estadoIcono.innerHTML = "✔";
    estadoIcono.className = "ml-2 text-green-600 font-bold text-lg";
  } else {
    organizadorItem.classList.replace("bg-gray-200", "bg-gray-100");
    organizadorInput.disabled = true;
    organizadorInput.classList.add("text-gray-400");
    estadoIcono.innerHTML = "✖";
    estadoIcono.className = "ml-2 text-gray-400 font-bold text-lg";
  }
}

// Guarda el organizador en localStorage al dar Continuar en paso 2
function guardarOrganizador() {
  const id = leerEventoActivo();
  actualizarCampo(id, "organizador", inputOrganizador.value.trim());
  actualizarCampo(id, "incluirOrganizador", checkboxIncluir.checked);
}

// Escuchadores del paso 2
inputOrganizador.addEventListener("input", actualizarOrganizador);
checkboxIncluir.addEventListener("change", actualizarOrganizador);

// Ejecutar al cargar para que el estado inicial sea correcto
actualizarOrganizador();

// ── Paso 3: Lista de participantes

// Crea y agrega un elemento de participante a la lista del DOM
function agregarParticipanteDOM(nombre) {
  const div = document.createElement("div");
  div.className = "flex items-center bg-gray-100 rounded-xl px-4 py-2";
  div.dataset.nombre = nombre;

  const input = document.createElement("input");
  input.type = "text";
  input.value = nombre;
  input.className = "w-full bg-transparent outline-none text-gray-600";

  // Si editan el nombre, actualizamos el dataset
  input.addEventListener("input", () => {
    div.dataset.nombre = input.value;
  });

  const btnEliminar = document.createElement("button");
  btnEliminar.textContent = "✕";
  btnEliminar.className = "ml-2 text-gray-400 hover:text-red-500";
  btnEliminar.addEventListener("click", () => div.remove());

  div.appendChild(input);
  div.appendChild(btnEliminar);
  listaParticipantes.appendChild(div);
}

// Botón "+" para agregar participante
btnAgregar.addEventListener("click", () => {
  const nombre = inputNuevo.value.trim();
  if (nombre === "") return;
  agregarParticipanteDOM(nombre);
  inputNuevo.value = "";
});

// También agregar con Enter
inputNuevo.addEventListener("keydown", (e) => {
  if (e.key === "Enter") btnAgregar.click();
});

// Recolecta todos los participantes del DOM y los guarda en localStorage
function guardarParticipantes() {
  const id = leerEventoActivo();

  // Recolectar participantes agregados manualmente
  const items = listaParticipantes.querySelectorAll("[data-nombre]");
  const participantes = Array.from(items)
    .map(div => div.dataset.nombre.trim())
    .filter(n => n !== "");

  // Si el organizador está incluido, agregarlo al inicio de la lista
  const incluir = checkboxIncluir.checked;
  const nombreOrg = inputOrganizador.value.trim();
  if (incluir && nombreOrg !== "" && !participantes.includes(nombreOrg)) {
    participantes.unshift(nombreOrg);
  }

  actualizarCampo(id, "participantes", participantes);
}