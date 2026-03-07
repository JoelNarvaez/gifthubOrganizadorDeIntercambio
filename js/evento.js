
// ── Estado local temporal ────────────────────────────────────
let tipoEventoSeleccionado  = "";
let fechaSeleccionada       = "";
let presupuestoSeleccionado = 0;
let imagenPersonalBase64    = "";

// Exponer al window para que main.js pueda resetearlas al crear nuevo evento
function resetearEstadoEvento() {
  tipoEventoSeleccionado  = "";
  fechaSeleccionada       = "";
  presupuestoSeleccionado = 0;
  imagenPersonalBase64    = "";
}

// ── Paso 6: Tipo de evento ───────────────────────────────────

const botonesEvento       = document.querySelectorAll(".evento-btn");
const inputEventoPersonal = document.getElementById("eventoPersonalizado");

// Marcar botón predefinido seleccionado
botonesEvento.forEach(btn => {
  btn.addEventListener("click", () => {
    botonesEvento.forEach(b => b.classList.remove("ring-2","ring-pink-500","bg-pink-50"));
    btn.classList.add("ring-2","ring-pink-500","bg-pink-50");
    tipoEventoSeleccionado = btn.dataset.evento;
    imagenPersonalBase64   = "";
    // Limpiar la card personalizada visualmente
    if (inputEventoPersonal) inputEventoPersonal.value = "";
    resetPreviewCustom();
  });
});

// Si escribe en el input personalizado, deseleccionar botones predefinidos
if (inputEventoPersonal) {
  inputEventoPersonal.addEventListener("input", onEscribeNombrePersonal);
}

function onEscribeNombrePersonal() {
  botonesEvento.forEach(b => b.classList.remove("ring-2","ring-pink-500","bg-pink-50"));
  tipoEventoSeleccionado = inputEventoPersonal.value.trim();
  actualizarPreviewCustom();
}

// ── Imagen personalizada: galería ───────────────────────────
function cargarImagenGaleria(event) {
  const archivo = event.target.files[0];
  if (!archivo) return;
  procesarArchivo(archivo);
}

// ── Imagen personalizada: drag & drop ───────────────────────
function soltar(event) {
  event.preventDefault();
  const zona = document.getElementById("zona-imagen-evento");
  zona.classList.remove("border-pink-500","bg-pink-50","scale-105");

  const archivo = event.dataTransfer.files[0];
  if (!archivo || !archivo.type.startsWith("image/")) return;
  procesarArchivo(archivo);
}

// ── Procesar archivo de imagen ────────────────────────────────
function procesarArchivo(archivo) {
  const reader = new FileReader();
  reader.onload = e => {
    imagenPersonalBase64 = e.target.result;

    const preview     = document.getElementById("preview-evento");
    const placeholder = document.getElementById("placeholder-imagen");
    const btnQuitar   = document.getElementById("btn-quitar-imagen");
    const campoNombre = document.getElementById("campo-nombre-custom");

    preview.src = imagenPersonalBase64;
    preview.classList.remove("hidden");
    placeholder.classList.add("hidden");
    btnQuitar.classList.remove("hidden");
    btnQuitar.style.display = "flex";

    // Mostrar campo de nombre
    if (campoNombre) campoNombre.classList.remove("hidden");

    // Deseleccionar predefinidos
    botonesEvento.forEach(b => b.classList.remove("ring-2","ring-pink-500","bg-pink-50"));

    actualizarPreviewCustom();
  };
  reader.readAsDataURL(archivo);
}

// ── Quitar imagen cargada ────────────────────────────────────
function quitarImagenEvento(event) {
  event.stopPropagation();
  imagenPersonalBase64 = "";

  const preview     = document.getElementById("preview-evento");
  const placeholder = document.getElementById("placeholder-imagen");
  const btnQuitar   = document.getElementById("btn-quitar-imagen");
  const inputFile   = document.getElementById("input-foto-evento");
  const campoNombre = document.getElementById("campo-nombre-custom");

  preview.src = "";
  preview.classList.add("hidden");
  placeholder.classList.remove("hidden");
  btnQuitar.classList.add("hidden");
  btnQuitar.style.display = "none";
  if (inputFile) inputFile.value = "";
  if (campoNombre) campoNombre.classList.add("hidden");

  actualizarPreviewCustom();
}

// ── Preview inferior: muestra imagen + nombre cuando ambos están ──
function actualizarPreviewCustom() {
  const nombre    = inputEventoPersonal ? inputEventoPersonal.value.trim() : "";
  const contenedor = document.getElementById("preview-custom-seleccionado");
  const miniImg   = document.getElementById("preview-mini");
  const miniNombre = document.getElementById("preview-nombre");

  if (!contenedor) return;

  if (imagenPersonalBase64 && nombre) {
    miniImg.src      = imagenPersonalBase64;
    miniNombre.textContent = nombre;
    contenedor.classList.remove("hidden");
    contenedor.style.display = "flex";
    tipoEventoSeleccionado   = nombre;
  } else {
    contenedor.classList.add("hidden");
  }
}

function resetPreviewCustom() {
  const contenedor = document.getElementById("preview-custom-seleccionado");
  if (contenedor) contenedor.classList.add("hidden");
  quitarImagenEvento({ stopPropagation: () => {} });
}

// ── Guarda el tipo de evento en localStorage ─────────────────
function guardarEvento6() {
  const id    = leerEventoActivo();
  const valor = (inputEventoPersonal && inputEventoPersonal.value.trim())
                  || tipoEventoSeleccionado;

  if (!valor) {
    alert("Por favor selecciona o escribe un tipo de evento.");
    return false;
  }

  actualizarCampo(id, "tipoEvento", valor);

  // Si hay imagen personalizada, guardarla limpia (sin saltos de línea)
  if (imagenPersonalBase64) {
    actualizarCampo(id, "imagenEvento", imagenPersonalBase64.replace(/\s/g, ""));
  } else {
    // Si eligió predefinido, limpiar imagen anterior
    actualizarCampo(id, "imagenEvento", "");
  }

  return true;
}

// ── Paso 7: Fecha ────────────────────────────────────────────

const inputFecha        = document.querySelector("#paso-7 input[type='date']");
const contenedorFechas  = document.getElementById("fechas-sugeridas"); // puede ser null si no existe en el HTML

// Generar 3 fechas sugeridas cercanas a hoy
function generarFechasSugeridas() {
  if (!contenedorFechas) return;

  contenedorFechas.innerHTML = "";
  const hoy = new Date();

  // Proponer el próximo viernes, sábado y domingo
  for (let i = 1; i <= 7; i++) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() + i);
    const dia = d.getDay();

    if (dia === 5 || dia === 6 || dia === 0) { // vie, sab, dom
      const label = d.toLocaleDateString("es-MX", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
      });
      const valor = d.toISOString().split("T")[0];

      const btn = document.createElement("button");
      btn.textContent = label;
      btn.className   = "fecha-sugerida-btn w-full text-left px-4 py-2 bg-gray-100 rounded-lg hover:bg-pink-100 transition text-sm mb-2";
      btn.dataset.fecha = valor;

      btn.addEventListener("click", () => {
        // Quitar selección anterior
        document.querySelectorAll(".fecha-sugerida-btn").forEach(b => {
          b.classList.remove("bg-pink-200", "font-semibold");
        });
        btn.classList.add("bg-pink-200", "font-semibold");
        fechaSeleccionada   = valor;
        inputFecha.value    = valor;
      });

      contenedorFechas.appendChild(btn);
    }
  }
}

// Escuchar cambio en el input de fecha manual
if (inputFecha) {
  inputFecha.addEventListener("change", () => {
    fechaSeleccionada = inputFecha.value;

    // Quitar selección de botones sugeridos
    document.querySelectorAll(".fecha-sugerida-btn").forEach(b => {
      b.classList.remove("bg-pink-200", "font-semibold");
    });
  });
}

// Guarda la fecha en localStorage
function guardarFecha() {
  const id    = leerEventoActivo();
  const valor = inputFecha ? inputFecha.value : fechaSeleccionada;

  if (!valor) {
    alert("Por favor selecciona una fecha.");
    return false;
  }

  actualizarCampo(id, "fecha", valor);
  return true;
}

// ── Paso 8: Presupuesto ──────────────────────────────────────

const botonesPresupuesto       = document.querySelectorAll(".presupuesto-btn");
const inputPresupuestoPersonal = document.getElementById("presupuestoPersonalizado");

// Marcar botón seleccionado visualmente
botonesPresupuesto.forEach(btn => {
  btn.addEventListener("click", () => {

    // Quitar selección anterior
    botonesPresupuesto.forEach(b => {
      b.classList.remove("ring-2", "ring-pink-500", "bg-pink-50");
    });

    // Marcar el seleccionado
    btn.classList.add("ring-2", "ring-pink-500", "bg-pink-50");

    // Guardar valor
    presupuestoSeleccionado = Number(btn.dataset.presupuesto);

    // Limpiar input personalizado
    if (inputPresupuestoPersonal) inputPresupuestoPersonal.value = "";
  });
});

// Si escribe monto personalizado, deseleccionar botones
if (inputPresupuestoPersonal) {
  inputPresupuestoPersonal.addEventListener("input", () => {
    botonesPresupuesto.forEach(b => {
      b.classList.remove("ring-2", "ring-pink-500", "bg-pink-50");
    });
    presupuestoSeleccionado = Number(inputPresupuestoPersonal.value) || 0;
  });
}

// Guarda el presupuesto en localStorage
function guardarPresupuesto() {
  const id    = leerEventoActivo();
  const valor = inputPresupuestoPersonal && inputPresupuestoPersonal.value
    ? Number(inputPresupuestoPersonal.value)
    : presupuestoSeleccionado;

  if (!valor || valor <= 0) {
    alert("Por favor selecciona o escribe un presupuesto.");
    return false;
  }

  actualizarCampo(id, "presupuesto", valor);
  return true;
}