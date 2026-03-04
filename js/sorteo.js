const participantes = ["Mariel", "Ana", "Carlos", "Luis", "Sofía", "Juan"];

function iniciarSorteo() {
  const contenedor = document.getElementById("participantes-container");
  const caja = document.getElementById("caja");
  const cajaAbierta = document.getElementById("caja-abierta");
  const info = document.getElementById("ganador-info");

  // Resetear
  contenedor.innerHTML = "";
  caja.classList.remove("hidden", "sacudiendo");
  cajaAbierta.classList.add("hidden");
  info.textContent = "¡Los nombres están entrando a la caja!";

  // Animar participantes
  participantes.forEach((nombre, index) => {
    const div = document.createElement("div");
    div.className = "participante";
    div.textContent = nombre;
    div.style.position = "absolute";
    div.style.top = "-50px";
    div.style.left = `${50 + Math.random() * 30 - 15}%`;
    div.style.opacity = "1";
    contenedor.appendChild(div);

    // Animar caída
    setTimeout(() => {
      div.style.transition = "top 1.5s ease, opacity 1.5s ease";
      div.style.top = "calc(100% - 50px)";
      div.style.opacity = "0";
    }, index * 300);
  });

  const tiempoCaida = participantes.length * 300 + 1500;

  // Sacudir la caja
  setTimeout(() => {
    caja.classList.add("sacudiendo");
  }, tiempoCaida);

  // Abrir la caja y mostrar ganador
  setTimeout(() => {
    caja.classList.add("hidden");
    cajaAbierta.classList.remove("hidden");
    const ganador = participantes[Math.floor(Math.random() * participantes.length)];
    info.textContent = `🎊 ¡El ganador es ${ganador}! 🎊`;
    lanzarConfeti();
  }, tiempoCaida + 1200);
}

function lanzarConfeti() {
  const contenedor = document.getElementById("participantes-container");
  const colores = ["#FF0000","#00FF00","#0000FF","#FFD700","#FF69B4"];

  for (let i = 0; i < 50; i++) {
    const confeti = document.createElement("div");
    confeti.className = "confeti-piece";
    confeti.style.setProperty("--color", colores[Math.floor(Math.random() * colores.length)]);
    confeti.style.setProperty("--x", (Math.random() * 200 - 100) + "px");
    confeti.style.left = Math.random() * 100 + "%";
    contenedor.appendChild(confeti);
    setTimeout(() => { confeti.remove(); }, 2000);
  }
}

function mostrarSorteo() {
  siguiente('paso-9','paso-11');
  iniciarSorteo();
}