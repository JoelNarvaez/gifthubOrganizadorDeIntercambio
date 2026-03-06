
// ── Algoritmo principal 
// Recibe:
//   participantes : ["Ana", "Luis", "Gina", "Lalo"]
//   exclusiones   : { "Gina": ["Angelica"], "Ana": ["Luis"] }
//
// Devuelve:
//   { "Ana": "Lalo", "Luis": "Gina", "Gina": "Luis", "Lalo": "Ana" }
//   o null si no fue posible encontrar una solución válida

function realizarSorteo(participantes, exclusiones) {
  const MAX_INTENTOS = 200;

  for (let intento = 0; intento < MAX_INTENTOS; intento++) {
    const resultado = intentarSorteo(participantes, exclusiones);
    if (resultado) return resultado;
  }

  // Si después de 200 intentos no hay solución, devolver null
  return null;
}

// ── Intento individual de sorteo
function intentarSorteo(participantes, exclusiones) {
  // Copiar y mezclar aleatoriamente los receptores
  const receptores = mezclar([...participantes]);

  const resultado = {};

  for (let i = 0; i < participantes.length; i++) {
    const dador    = participantes[i];
    const receptor = receptores[i];

    // Condición 1: nadie se sortea a sí mismo
    if (dador === receptor) return null;

    // Condición 2: respetar exclusiones
    const excluidos = exclusiones[dador] || [];
    if (excluidos.includes(receptor)) return null;

    resultado[dador] = receptor;
  }

  return resultado;
}

// ── Mezcla aleatoria (Fisher-Yates)
function mezclar(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ── Función pública que lee de localStorage y ejecuta 
// Devuelve el resultado del sorteo o null si falló
function ejecutarSorteo() {
  const id            = leerEventoActivo();
  const participantes  = leerCampo(id, "participantes") || [];
  const exclusiones    = leerCampo(id, "exclusiones")   || {};

  if (participantes.length < 2) {
    alert("Se necesitan al menos 2 participantes para el sorteo.");
    return null;
  }

  const resultado = realizarSorteo(participantes, exclusiones);

  if (!resultado) {
    alert("No fue posible realizar el sorteo con las exclusiones actuales. Intenta reducir las exclusiones.");
    return null;
  }

  // Guardar resultado en localStorage para poder mostrarlo después
  actualizarCampo(id, "resultadoSorteo", resultado);

  return resultado;
}