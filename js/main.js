
// ── Toast de error ───────────────────────────────────────────
function mostrarError(pasoId, mensaje) {
  const prev = document.getElementById("toast-error");
  if (prev) prev.remove();
  const toast = document.createElement("div");
  toast.id = "toast-error";
  toast.style.cssText = `
    position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
    background:#ef4444; color:white; padding:12px 20px; border-radius:14px;
    font-size:0.875rem; font-weight:600; box-shadow:0 8px 24px rgba(239,68,68,0.35);
    z-index:9999; white-space:nowrap;
  `;
  toast.textContent = "⚠️ " + mensaje;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ── Navegación ───────────────────────────────────────────────
function siguiente(actual, siguientePaso) {
  document.getElementById(actual).classList.add("hidden");
  document.getElementById(siguientePaso).classList.remove("hidden");
  if (window.actualizarDeco)     window.actualizarDeco(siguientePaso);
  if (window.actualizarProgreso) window.actualizarProgreso(siguientePaso);
  alEntrarPaso(siguientePaso);
}

function alEntrarPaso(paso) {
  switch (paso) {

    case "paso-2": {
      const nombreEvento = document.getElementById("nombre-evento").value.trim();
      if (!nombreEvento) {
        siguiente("paso-2", "paso-1");
        mostrarError("paso-1", "Por favor escribe un nombre para el evento.");
        return;
      }
      actualizarCampo(leerEventoActivo(), "nombreEvento", nombreEvento);
      break;
    }

    case "paso-3": {
      const nombreOrg = document.getElementById("organizador-nombre").value.trim();
      if (!nombreOrg) {
        siguiente("paso-3", "paso-2");
        mostrarError("paso-2", "Por favor escribe tu nombre antes de continuar.");
        return;
      }
      guardarOrganizador();
      actualizarOrganizador();
      break;
    }

    case "paso-4": {
      const items = document.querySelectorAll("#lista-participantes [data-nombre]");
      const extras = Array.from(items)
        .filter(d => d.id !== "organizador-item")
        .map(d => d.dataset.nombre.trim())
        .filter(n => n !== "");
      if (extras.length < 1) {
        siguiente("paso-4", "paso-3");
        mostrarError("paso-3", "Agrega al menos un participante para continuar.");
        return;
      }
      guardarParticipantes();
      break;
    }

    case "paso-5": {
      guardarParticipantes();
      renderizarPaso5();
      break;
    }

    case "paso-6": {
      guardarParticipantes();
      guardarExclusiones();
      break;
    }

    case "paso-7": {
      if (!guardarEvento6()) {
        siguiente("paso-7", "paso-6");
        return;
      }
      generarFechasSugeridas();
      break;
    }

    case "paso-8": {
      if (!guardarFecha()) {
        siguiente("paso-8", "paso-7");
        return;
      }
      break;
    }

    case "paso-9": {
      if (!guardarPresupuesto()) {
        siguiente("paso-9", "paso-8");
        return;
      }
      break;
    }

    case "paso-10": {
      mostrarResumen();
      break;
    }
  }
}

// ── Sorteo ───────────────────────────────────────────────────
function mostrarSorteo() {
  const resultado = ejecutarSorteo();
  if (!resultado) return;
  siguiente("paso-9", "paso-11");
  animarSorteo(resultado);
}

function mostrarResumen() {

  const id = leerEventoActivo();
  const evento = leerEventoPorId(id);

  if (!evento) {
    document.getElementById("paso-10").innerHTML =
      `<p class="text-red-500 text-sm">No se encontró información del evento.</p>`;
    return;
  }

  if (evento.imagenEvento) {
    evento.imagenEvento = evento.imagenEvento.replace(/[\s\n\r]/g, "");
  }

  const participantes = evento.participantes || [];
  const exclusiones = evento.exclusiones || {};
  const resultadoSorteo = evento.resultadoSorteo || null;

  const iconoPorTipo = t => {
    if (!t) return "🎁";
    if (t.includes("Navidad")) return "🎄";
    if (t.includes("Valentin")) return "💝";
    if (t.includes("Nino")) return "🧸";
    if (t.includes("Madres")) return "💐";
    if (t.includes("Halloween")) return "🎃";
    return "🎉";
  };

  const chipsHTML = participantes.length
    ? participantes.map(p => `
        <span class="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-pink-50 text-pink-700 border border-pink-200">
          👤 ${p}
        </span>
      `).join("")
    : `<span class="text-gray-400 text-sm italic">Sin participantes</span>`;

  const exclEntries = Object.entries(exclusiones).filter(([, v]) => v.length > 0);

  const exclHTML = exclEntries.length
    ? exclEntries.map(([persona, ex]) => `
      <div class="flex items-center flex-wrap gap-2 p-2 bg-pink-50 rounded-lg text-sm">
        <span class="font-semibold text-gray-700">${persona}</span>
        <span class="text-gray-400 text-xs">no sortea a</span>
        ${ex.map(e => `
          <span class="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-600 font-medium">
            ${e}
          </span>`).join("")}
      </div>
    `).join("")
    : `<p class="text-gray-400 text-sm italic">Sin restricciones configuradas</p>`;

  const sorteoHTML = resultadoSorteo && Object.keys(resultadoSorteo).length
    ? `
      <div class="flex flex-col gap-2">
        ${Object.entries(resultadoSorteo).map(([d, r]) => `
          <div class="flex items-center justify-between px-4 py-2 rounded-lg border border-pink-200 bg-pink-50">
            <span class="font-medium text-gray-700">${d}</span>
            <span>🎁</span>
            <span class="font-semibold text-pink-600">${r}</span>
          </div>
        `).join("")}
      </div>
    `
    : `
      <div class="text-center p-4 border border-dashed border-gray-200 rounded-lg text-gray-400 text-sm italic">
        El sorteo aún no se ha realizado
      </div>
    `;

  const iconoHtml = evento.imagenEvento
    ? `<img src="${evento.imagenEvento}" class="w-14 h-14 rounded-xl object-cover" alt="evento">`
    : `
      <div class="w-14 h-14 rounded-xl bg-white/30 flex items-center justify-center text-2xl">
        ${iconoPorTipo(evento.tipoEvento)}
      </div>
    `;

  document.getElementById("paso-10").innerHTML = `
  
  <div class="w-full max-w-2xl mx-auto flex flex-col gap-5 max-h-[60vh] overflow-y-auto pr-1">

    <!-- Header evento -->
    <div class="relative p-5 rounded-2xl bg-gradient-to-r from-pink-500 to-pink-300 text-white shadow-md">
      
      <div class="flex items-center gap-4">
        ${iconoHtml}

        <div>
          <h2 class="text-xl font-bold leading-tight">
            ${evento.nombreEvento || "Sin nombre"}
          </h2>
          <p class="text-sm text-white/80">
            ${evento.tipoEvento || "Evento personalizado"}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3 mt-4">

        <div class="bg-white/20 rounded-lg p-2 text-center">
          <div class="text-lg">👤</div>
          <div class="text-xs text-white/80">Organizador</div>
          <div class="text-sm font-semibold break-words">
            ${evento.organizador || "—"}
          </div>
        </div>

        <div class="bg-white/20 rounded-lg p-2 text-center">
          <div class="text-lg">📅</div>
          <div class="text-xs text-white/80">Fecha</div>
          <div class="text-sm font-semibold">
            ${evento.fecha || "—"}
          </div>
        </div>

        <div class="bg-white/20 rounded-lg p-2 text-center">
          <div class="text-lg">💰</div>
          <div class="text-xs text-white/80">Presupuesto</div>
          <div class="text-sm font-semibold">
            ${evento.presupuesto ? "$" + evento.presupuesto : "—"}
          </div>
        </div>

      </div>

    </div>

    <!-- Participantes -->
    <div class="bg-white border border-pink-100 rounded-xl p-4 shadow-sm">
      
      <div class="flex justify-between items-center mb-3">
        <h3 class="font-semibold text-gray-700 flex items-center gap-2">
          👥 Participantes
        </h3>

        <span class="text-xs font-bold bg-pink-100 text-pink-600 px-3 py-1 rounded-full">
          ${participantes.length}
        </span>
      </div>

      <div class="flex flex-wrap gap-2">
        ${chipsHTML}
      </div>

    </div>

    <!-- Restricciones -->
    <div class="bg-white border border-pink-100 rounded-xl p-4 shadow-sm">

      <h3 class="font-semibold text-gray-700 mb-3">
        Restricciones
      </h3>

      <div class="flex flex-col gap-2">
        ${exclHTML}
      </div>

    </div>

    <!-- Resultado sorteo -->
    <div class="bg-white border border-pink-100 rounded-xl p-4 shadow-sm">

      <h3 class="font-semibold text-gray-700 mb-3">
        Resultado del sorteo
      </h3>

      ${sorteoHTML}

    </div>

    <button
      onclick="siguiente('paso-10','paso-9')"
      class="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-pink-300 text-white font-semibold hover:opacity-90 transition">
      ← Volver
    </button>

  </div>
  `;
}

// ── Menú hamburguesa ─────────────────────────────────────────
function cerrarMenuMovil() {
  const m = document.getElementById("mobile-menu");
  if (m) m.classList.add("hidden");
}

// ── Drawer: Mis Eventos ──────────────────────────────────────
function abrirDrawer() {
  const overlay = document.getElementById("drawer-overlay");
  const drawer  = document.getElementById("drawer-eventos");
  if (!overlay || !drawer) return;
  renderizarDrawer();
  overlay.classList.remove("hidden");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      drawer.classList.remove("translate-x-full");
      drawer.classList.add("translate-x-0");
    });
  });
}

function cerrarDrawer() {
  const overlay = document.getElementById("drawer-overlay");
  const drawer  = document.getElementById("drawer-eventos");
  if (!overlay || !drawer) return;
  drawer.classList.remove("translate-x-0");
  drawer.classList.add("translate-x-full");
  setTimeout(() => overlay.classList.add("hidden"), 300);
}

function renderizarDrawer() {
  const lista    = document.getElementById("drawer-lista");
  const contador = document.getElementById("drawer-count");
  const eventos  = leerEventos();
  lista.innerHTML = "";

  if (eventos.length === 0) {
    contador.textContent = "Sin eventos guardados";
    lista.innerHTML = `
      <div class="flex flex-col items-center justify-center py-20 text-center">
        <div class="text-5xl mb-4">🎁</div>
        <p class="text-gray-400 text-sm leading-relaxed">Aún no tienes eventos.<br>¡Crea tu primero!</p>
      </div>`;
    return;
  }

  contador.textContent = `${eventos.length} evento${eventos.length!==1?"s":""} guardado${eventos.length!==1?"s":""}`;

  const iconoPorTipo = t => {
    if (!t) return "🎁";
    if (t.includes("Navidad"))   return "🎄";
    if (t.includes("Valentin"))  return "💝";
    if (t.includes("Nino"))      return "🧸";
    if (t.includes("Madres"))    return "💐";
    if (t.includes("Halloween")) return "🎃";
    return "🎁";
  };

  [...eventos].reverse().forEach(ev => {
    const idEvento  = ev.id;
    const nombre    = ev.nombreEvento || "Sin nombre";
    const tipo      = ev.tipoEvento   || "";
    const fecha     = ev.fecha        || "—";
    const presup    = ev.presupuesto  ? `$${ev.presupuesto}` : "—";
    const parts     = ev.participantes || [];
    const tieneSorteo = ev.resultadoSorteo && Object.keys(ev.resultadoSorteo).length > 0;
    const esActivo    = leerEventoActivo() === idEvento;

    const resultadoHTML = tieneSorteo
      ? Object.entries(ev.resultadoSorteo).map(([d,r]) => `
          <div class="flex items-center justify-between py-1.5 border-b border-pink-50 last:border-0 text-xs">
            <span class="text-gray-500">${d}</span><span>🎁</span>
            <span class="text-pink-600 font-semibold">${r}</span>
          </div>`).join("")
      : `<p class="text-xs text-gray-400 italic">Sorteo no realizado aún.</p>`;

    const exclusionesHTML = (() => {
      const excl = Object.entries(ev.exclusiones || {}).filter(([,v]) => v.length > 0);
      if (!excl.length) return `<p class="text-xs text-gray-400 italic">Sin restricciones.</p>`;
      return excl.map(([p,ex]) =>
        `<p class="text-xs text-gray-500"><span class="font-medium">${p}</span> no sortea a: ${ex.join(", ")}</p>`
      ).join("");
    })();

    const iconoDrawer = ev.imagenEvento
      ? `<img src="${ev.imagenEvento.replace(/[\s\n\r]/g,'')}" alt=""
              style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`
      : iconoPorTipo(tipo);

    const card = document.createElement("div");
    card.className = "rounded-2xl border overflow-hidden shadow-sm transition hover:shadow-md " +
      (esActivo ? "border-pink-300 ring-1 ring-pink-200" : "border-gray-100");

    card.innerHTML = `
      <div class="flex items-center justify-between px-4 py-3 cursor-pointer
                  hover:bg-pink-50 transition bg-gray-50"
           onclick="toggleEvento('det-${idEvento}', this)">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl
                      flex-shrink-0 overflow-hidden
                      ${esActivo?'bg-pink-100':'bg-white border border-gray-100'}">
            ${iconoDrawer}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <p class="font-semibold text-gray-800 text-sm truncate">${nombre}</p>
              ${esActivo?'<span class="text-[10px] bg-pink-500 text-white px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">Activo</span>':""}
            </div>
            <p class="text-xs text-gray-400 truncate">${tipo||"Sin tipo"} · ${fecha}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0 ml-2">
          ${tieneSorteo?'<span class="hidden sm:block text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">✓ Sorteado</span>':""}
          <span class="text-gray-300 text-xs chevron transition-transform duration-200">▼</span>
        </div>
      </div>

      <div id="det-${idEvento}" class="hidden bg-white border-t border-gray-50">
        <div class="grid grid-cols-3 divide-x divide-gray-50 border-b border-gray-50">
          <div class="px-3 py-2 text-center">
            <p class="text-[10px] text-gray-400 uppercase tracking-wide">Organizador</p>
            <p class="text-xs font-semibold text-gray-700 mt-0.5 truncate">${ev.organizador||"—"}</p>
          </div>
          <div class="px-3 py-2 text-center">
            <p class="text-[10px] text-gray-400 uppercase tracking-wide">Participantes</p>
            <p class="text-xs font-semibold text-gray-700 mt-0.5">${parts.length}</p>
          </div>
          <div class="px-3 py-2 text-center">
            <p class="text-[10px] text-gray-400 uppercase tracking-wide">Presupuesto</p>
            <p class="text-xs font-semibold text-pink-500 mt-0.5">${presup}</p>
          </div>
        </div>
        <div class="px-4 py-3 space-y-3">
          <div>
            <p class="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-1">Participantes</p>
            <div class="flex flex-wrap gap-1">
              ${parts.length
                ? parts.map(p=>`<span class="text-xs bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">${p}</span>`).join("")
                : `<span class="text-xs text-gray-400 italic">Sin participantes</span>`}
            </div>
          </div>
          <div>
            <p class="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-1">Restricciones</p>
            ${exclusionesHTML}
          </div>
          <div class="bg-pink-50 rounded-xl p-3">
            <p class="text-[10px] text-pink-500 uppercase tracking-wide font-semibold mb-2">Resultado del sorteo</p>
            ${resultadoHTML}
          </div>
          <div class="flex gap-2 pt-1 pb-1">
            <button onclick="cargarEvento(${idEvento})"
                    class="flex-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-500
                           py-2.5 rounded-xl font-semibold transition">
              ▶ Reanudar
            </button>
            <button onclick="confirmarEliminar(${idEvento},'${nombre.replace(/'/g,"\\'")}',event)"
                    class="flex-1 text-xs bg-red-50 hover:bg-red-100 text-red-400
                           py-2.5 rounded-xl font-semibold transition">
              🗑 Eliminar
            </button>
          </div>
        </div>
      </div>
    `;
    lista.appendChild(card);
  });
}

function toggleEvento(detalleId, cabecera) {
  const detalle = document.getElementById(detalleId);
  if (!detalle) return;
  const chevron = cabecera.querySelector(".chevron");
  const abierto = !detalle.classList.contains("hidden");
  detalle.classList.toggle("hidden");
  if (chevron) chevron.style.transform = abierto ? "rotate(0deg)" : "rotate(180deg)";
}

function cargarEvento(id) {
  guardarEventoActivo(id);
  cerrarDrawer();
  document.querySelectorAll("[id^='paso-']").forEach(p => p.classList.add("hidden"));
  document.getElementById("paso-9").classList.remove("hidden");
}

function confirmarEliminar(id, nombre, event) {
  event.stopPropagation();
  if (!confirm(`¿Eliminar el evento "${nombre}"?\nEsta acción no se puede deshacer.`)) return;
  if (leerEventoActivo() === id) limpiarEventoActivo();
  eliminarEvento(id);
  renderizarDrawer();
}

// ── Finalizar evento y comenzar uno nuevo ────────────────────
// ── Finalizar evento (guarda en historial, limpia y regresa al inicio) ───
function finalizarEvento() {
  limpiarEventoActivo();
  limpiarCamposDom();
  document.querySelectorAll("[id^='paso-']").forEach(p => p.classList.add("hidden"));
  document.getElementById("paso-0").classList.remove("hidden");
}

// ── Limpiar todos los campos del DOM ─────────────────────────
function limpiarCamposDom() {
  if (typeof resetearEstadoEvento  === "function") resetearEstadoEvento();
  if (typeof resetearExclusiones   === "function") resetearExclusiones();

  const get = id => document.getElementById(id);

  const elNombreEvento   = get("nombre-evento");
  const elNombreOrg      = get("organizador-nombre");
  const elCheckbox       = get("incluirOrganizador");
  const inputNuevo       = get("nuevo-participante");
  const listaPartic      = get("lista-participantes");
  const elEventoPersonal = get("eventoPersonalizado");
  //const elFecha          = get("input-fecha");
  const elFecha = document.querySelector("#paso-7 input[type='date']"); //ANA AGREGA ESTO
  const elPresupuesto    = get("presupuestoPersonalizado");
  const campoNombre      = get("campo-nombre-custom");
  const previewCustom    = get("preview-custom-seleccionado");
  const previewEvento    = get("preview-evento");
  const placeholder      = get("placeholder-imagen");
  const btnQuitarImg     = get("btn-quitar-imagen");
  const inputFotoFile    = get("input-foto-evento");
  const contenedorFechas = get("fechas-sugeridas");
  const orgItem          = get("organizador-item");
  const orgInput         = get("organizador-nombre");

  if (elNombreEvento)    elNombreEvento.value  = "";
  if (elNombreOrg)       elNombreOrg.value     = "";
  if (elCheckbox)        elCheckbox.checked    = true;
  if (inputNuevo)        inputNuevo.value      = "";
  if (elEventoPersonal)  elEventoPersonal.value = "";
  if (elFecha)           elFecha.value         = "";
  if (elPresupuesto)     elPresupuesto.value   = "";
  if (contenedorFechas)  contenedorFechas.innerHTML = "";
  if (campoNombre)       campoNombre.classList.add("hidden");
  if (previewCustom)  { previewCustom.classList.add("hidden"); previewCustom.style.display = "none"; }
  if (previewEvento)  { previewEvento.src = ""; previewEvento.classList.add("hidden"); }
  if (placeholder)    { placeholder.classList.remove("hidden"); }
  if (btnQuitarImg)   { btnQuitarImg.classList.add("hidden"); btnQuitarImg.style.display = "none"; }
  if (inputFotoFile)  inputFotoFile.value = "";
  if (orgItem)           delete orgItem.dataset.nombre;
  if (orgInput)          orgInput.value        = "";

  if (listaPartic)
    listaPartic.querySelectorAll("[data-nombre]:not(#organizador-item)").forEach(el => el.remove());

  document.querySelectorAll(".evento-btn, .presupuesto-btn, .fecha-sugerida-btn")
          .forEach(b => b.classList.remove("seleccionado"));

  // ANA AGREGA ESTO
  const inputOrg = document.getElementById("nombre-organizador");
  if (inputOrg) {
    inputOrg.value = "";
    inputOrg.dispatchEvent(new Event("input"));
  }
  if (typeof actualizarOrganizador === "function") actualizarOrganizador(); // ANA TERMINA DE AGREGAR AQUÍ
}

// ── Nuevo evento (siempre limpio) ────────────────────────────
function nuevoEvento() {
  const id = crearEvento();
  guardarEventoActivo(id);
  limpiarCamposDom();
  document.querySelectorAll("[id^='paso-']").forEach(p => p.classList.add("hidden"));
  document.getElementById("paso-1").classList.remove("hidden");
}

// ── Arranque ─────────────────────────────────────────────────
(function init() {
  // Hamburguesa
  const btnMenu   = document.getElementById("menu-btn");
  const menuMovil = document.getElementById("mobile-menu");
  if (btnMenu && menuMovil) {
    btnMenu.addEventListener("click", () => menuMovil.classList.toggle("hidden"));
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768) menuMovil.classList.add("hidden");
    });
  }

  // Botón Comenzar — siempre crea un evento nuevo limpio
  const btnComenzar = document.getElementById("btn-comenzar");
  if (!btnComenzar) return;
  btnComenzar.removeAttribute("onclick");
  btnComenzar.addEventListener("click", () => {
    const id = crearEvento();
    guardarEventoActivo(id);
    limpiarCamposDom();
    siguiente("paso-0", "paso-1");
  });
})();