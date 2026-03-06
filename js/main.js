
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
      const nombreOrg = document.getElementById("nombre-organizador").value.trim();
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

// ── Resumen ──────────────────────────────────────────────────
function mostrarResumen() {
  const id     = leerEventoActivo();
  const evento = leerEventoPorId(id);
  if (!evento) {
    document.getElementById("paso-10").innerHTML =
      `<p style="color:#ef4444;font-size:0.9rem;">No se encontró información del evento.</p>`;
    return;
  }

  if (evento.imagenEvento) {
    evento.imagenEvento = evento.imagenEvento.replace(/[\s\n\r]/g, "");
  }

  const participantes   = evento.participantes  || [];
  const exclusiones     = evento.exclusiones    || {};
  const resultadoSorteo = evento.resultadoSorteo || null;

  const iconoPorTipo = t => {
    if (!t) return "🎁";
    if (t.includes("Navidad"))   return "🎄";
    if (t.includes("Valentin"))  return "💝";
    if (t.includes("Nino"))      return "🧸";
    if (t.includes("Madres"))    return "💐";
    if (t.includes("Halloween")) return "🎃";
    return "🎉";
  };

  const chipsHTML = participantes.length
    ? participantes.map(p => `
        <span style="display:inline-flex;align-items:center;gap:5px;
          padding:4px 12px;border-radius:50px;font-size:0.78rem;font-weight:500;
          background:#fdf2f8;color:#be185d;border:1px solid #fbcfe8;">👤 ${p}</span>`).join("")
    : `<span style="color:#9ca3af;font-size:0.82rem;font-style:italic;">Sin participantes</span>`;

  const exclEntries = Object.entries(exclusiones).filter(([, v]) => v.length > 0);
  const exclHTML = exclEntries.length
    ? exclEntries.map(([persona, ex]) => `
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;
          padding:7px 12px;background:#fdf2f8;border-radius:10px;font-size:0.8rem;">
          <span style="font-weight:600;color:#374151;">${persona}</span>
          <span style="color:#d1d5db;font-size:0.7rem;">no sortea a</span>
          ${ex.map(e => `<span style="padding:2px 8px;border-radius:50px;font-size:0.75rem;
            background:#fee2e2;color:#dc2626;font-weight:500;">${e}</span>`).join("")}
        </div>`).join("")
    : `<p style="color:#9ca3af;font-size:0.82rem;font-style:italic;padding:6px 0;">Sin restricciones configuradas</p>`;

  const sorteoHTML = resultadoSorteo && Object.keys(resultadoSorteo).length
    ? `<div style="display:flex;flex-direction:column;gap:6px;">
        ${Object.entries(resultadoSorteo).map(([d, r], i) => `
          <div style="display:flex;align-items:center;justify-content:space-between;
            padding:9px 14px;border-radius:12px;
            background:${i%2===0?'#fdf2f8':'#fff'};border:1px solid #fbcfe8;">
            <span style="font-size:0.85rem;font-weight:600;color:#374151;">${d}</span>
            <span>🎁</span>
            <span style="font-size:0.85rem;font-weight:700;color:#db2777;">${r}</span>
          </div>`).join("")}
      </div>`
    : `<div style="text-align:center;padding:16px;border-radius:12px;
        background:#f9fafb;border:1.5px dashed #e5e7eb;
        color:#9ca3af;font-size:0.82rem;font-style:italic;">
        El sorteo aún no se ha realizado</div>`;

  const iconoHtml = evento.imagenEvento
    ? `<img src="${evento.imagenEvento}" alt="evento"
            style="width:52px;height:52px;border-radius:14px;object-fit:cover;flex-shrink:0;display:block;">`
    : `<div style="width:52px;height:52px;border-radius:14px;
          background:rgba(255,255,255,0.25);display:flex;align-items:center;
          justify-content:center;font-size:1.6rem;flex-shrink:0;">
          ${iconoPorTipo(evento.tipoEvento)}</div>`;

  document.getElementById("paso-10").innerHTML = `
    <div style="display:flex;flex-direction:column;gap:0;width:100%;overflow-y:auto;max-height:480px;padding-right:2px;">

      <div style="background:linear-gradient(135deg,#ec4899 0%,#f9a8d4 100%);
          border-radius:16px;padding:20px 20px 16px;margin-bottom:14px;
          position:relative;overflow:hidden;">
        <div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;
            border-radius:50%;background:rgba(255,255,255,0.12);"></div>
        <div style="position:absolute;bottom:-30px;right:30px;width:70px;height:70px;
            border-radius:50%;background:rgba(255,255,255,0.08);"></div>

        <div style="display:flex;align-items:flex-start;gap:14px;position:relative;z-index:1;">
          ${iconoHtml}
          <div style="min-width:0;">
            <p style="font-family:'Fredoka',sans-serif;font-size:1.3rem;font-weight:700;
                color:white;line-height:1.2;margin-bottom:4px;">
              ${evento.nombreEvento || "Sin nombre"}</p>
            <p style="font-size:0.78rem;color:rgba(255,255,255,0.8);">
              ${evento.tipoEvento || "Evento personalizado"}</p>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:16px;">
          ${[
            {label:"Organizador", val:evento.organizador||"—",       icon:"👤"},
            {label:"Fecha",       val:evento.fecha||"—",             icon:"📅"},
            {label:"Presupuesto", val:evento.presupuesto?"$"+evento.presupuesto:"—", icon:"💰"}
          ].map(s=>`
            <div style="background:rgba(255,255,255,0.2);border-radius:10px;
                padding:8px 10px;text-align:center;">
              <div style="font-size:1rem;margin-bottom:2px;">${s.icon}</div>
              <div style="font-size:0.72rem;color:rgba(255,255,255,0.75);margin-bottom:1px;">${s.label}</div>
              <div style="font-size:0.78rem;font-weight:700;color:white;
                  word-break:break-word;line-height:1.2;">${s.val}</div>
            </div>`).join("")}
        </div>
      </div>

      <div style="background:white;border:1.5px solid #fce7f3;border-radius:14px;
          padding:14px 16px;margin-bottom:10px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <p style="font-family:'Fredoka',sans-serif;font-size:1rem;font-weight:600;color:#374151;">
            👥 Participantes</p>
          <span style="padding:2px 10px;border-radius:50px;font-size:0.72rem;font-weight:700;
              background:#fce7f3;color:#db2777;">${participantes.length}</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">${chipsHTML}</div>
      </div>

      <div style="background:white;border:1.5px solid #fce7f3;border-radius:14px;
          padding:14px 16px;margin-bottom:10px;">
        <p style="font-family:'Fredoka',sans-serif;font-size:1rem;font-weight:600;
            color:#374151;margin-bottom:10px;">🚫 Restricciones</p>
        <div style="display:flex;flex-direction:column;gap:6px;">${exclHTML}</div>
      </div>

      <div style="background:white;border:1.5px solid #fce7f3;border-radius:14px;
          padding:14px 16px;margin-bottom:14px;">
        <p style="font-family:'Fredoka',sans-serif;font-size:1rem;font-weight:600;
            color:#374151;margin-bottom:10px;">🎲 Resultado del sorteo</p>
        ${sorteoHTML}
      </div>

      <button onclick="siguiente('paso-10','paso-9')" class="btn-continuar"
              style="width:100%;padding:12px;border-radius:14px;border:none;
                background:linear-gradient(135deg,#ec4899,#f9a8d4);
                color:white;font-family:'DM Sans',sans-serif;
                font-size:0.9rem;font-weight:600;cursor:pointer;">
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

// ── Nuevo evento ─────────────────────────────────────────────
function nuevoEvento() {
  const id = crearEvento();
  guardarEventoActivo(id);
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

  // Botón Comenzar
  const btnComenzar = document.getElementById("btn-comenzar");
  if (!btnComenzar) return;
  btnComenzar.removeAttribute("onclick");
  btnComenzar.addEventListener("click", () => {
    let id = leerEventoActivo();
    if (!id) { id = crearEvento(); guardarEventoActivo(id); }
    siguiente("paso-0", "paso-1");
  });
})();