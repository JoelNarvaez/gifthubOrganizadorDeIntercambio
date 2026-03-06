
const CLAVE = "cadeau-eventos"; 

// ── Leer todos los eventos
function leerEventos() {
  const raw = localStorage.getItem(CLAVE);
  return raw ? JSON.parse(raw) : [];
}

// ── Leer un evento por id
function leerEventoPorId(id) {
  const lista = leerEventos();
  return lista.find(e => e.id === id) || null;
}

// ── Crear un evento nuevo vacío y devolver su id 
function crearEvento() {
  const lista = leerEventos();
  const nuevoId = Date.now(); // id único basado en timestamp
  const nuevo = {
    id: nuevoId,
    organizador: "",
    incluirOrganizador: true,
    participantes: [],
    exclusiones: {},
    tipoEvento: "",
    fecha: "",
    presupuesto: 0
  };
  lista.push(nuevo);
  localStorage.setItem(CLAVE, JSON.stringify(lista));
  return nuevoId;
}

// ── Actualizar un campo de un evento específico ──────────────
function actualizarCampo(id, campo, valor) {
  const lista = leerEventos();
  const idx = lista.findIndex(e => e.id === id);
  if (idx === -1) return;
  lista[idx][campo] = valor;
  localStorage.setItem(CLAVE, JSON.stringify(lista));
}

// ── Leer un campo de un evento específico 
function leerCampo(id, campo) {
  const evento = leerEventoPorId(id);
  return evento ? evento[campo] : null;
}

// ── Eliminar un evento por id 
function eliminarEvento(id) {
  const lista = leerEventos().filter(e => e.id !== id);
  localStorage.setItem(CLAVE, JSON.stringify(lista));
}

// ── Limpiar todo
function limpiarTodo() {
  localStorage.removeItem(CLAVE);
}

// ── Id del evento activo (el que se está configurando ahora)
const CLAVE_ACTIVO = "cadeau-activo";

function guardarEventoActivo(id) {
  localStorage.setItem(CLAVE_ACTIVO, id);
}

function leerEventoActivo() {
  const id = localStorage.getItem(CLAVE_ACTIVO);
  return id ? Number(id) : null;
}

function limpiarEventoActivo() {
  localStorage.removeItem(CLAVE_ACTIVO);
}