let seleccion = [];
let indicePregunta = 0;
let aciertos = 0;
let fallos=0;
let saltadas=0;
let cantidadPreguntas=0;

async function cargarXML() {
  const response = await fetch('../xml/ProgramacionQuiz.xml');
  const text = await response.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, "text/xml");

  // Acceder a las preguntas dentro de <Cuestionario>
  const preguntas = Array.from(xmlDoc.getElementsByTagName("pregunta")).map(p => ({
    enunciado: p.getElementsByTagName("enunciado")[0]?.textContent ?? "",
    A: p.getElementsByTagName("A")[0]?.textContent ?? "",
    B: p.getElementsByTagName("B")[0]?.textContent ?? "",
    C: p.getElementsByTagName("C")[0]?.textContent ?? "",
    D: p.getElementsByTagName("D")[0]?.textContent ?? "",
    respuestaCorrecta: p.getElementsByTagName("respuesta_correcta")[0]?.textContent ?? "",
    explicacion: p.getElementsByTagName("respuesta_correcta")[0]?.getAttribute("explicacion") ?? ""
  }));
  cantidadPreguntas= preguntas.length;
  seleccion =obtenerPreguntasAleatorias(preguntas);
  mostrarPregunta();
}




//mostramos la pregunta
function mostrarPregunta() {
  if (indicePregunta >= seleccion.length) {
    let marcador= (aciertos*0.25)-(fallos*0.08);
    document.getElementById("pregunta-container").innerHTML = `<h2>Juego terminado! Nota obtenida: ${marcador}</h2>
    <h2>Aciertos ${aciertos}</h2>
    <h2>Fallos ${fallos}</h2>
    <h2>No respondidas ${saltadas}</h2>`;
    return;
  }

  const preguntaActual = seleccion[indicePregunta];
  let opcionesHTML = "";

  // Crear botones con las opciones correctamente referenciadas
  ['A', 'B', 'C', 'D'].forEach(letra => {
    const textoOpcion = preguntaActual[letra];
    opcionesHTML += `<li><button onclick="verificarRespuesta('${letra}')">${textoOpcion}</button></li>`;
  });

  document.getElementById("pregunta-container").innerHTML = `
      <h3>${preguntaActual.enunciado}</h3>
      <ul>
      ${opcionesHTML}
      <li><button onclick="saltar()">Dejar sin contestar</button></li>
      </ul>
      <p>Pregunta ${indicePregunta+1} de 40 . Preguntas XML total: ${cantidadPreguntas}</p>`;
}

function verificarRespuesta(letraSeleccionada) {
  const preguntaActual = seleccion[indicePregunta];
  const letraCorrecta = preguntaActual.respuestaCorrecta;
  const respuestaDiv = document.getElementById("respuesta");

  if (letraSeleccionada === letraCorrecta) {
      aciertos++;
      respuestaDiv.innerHTML = `¡Correcto!`;
      setTimeout(() => {
          respuestaDiv.style.display = "none";
          cargarSiguientePregunta();
      }, 3000);
  } else {
      const respuestaCorrectaTexto = preguntaActual[letraCorrecta];
      respuestaDiv.innerHTML = `Incorrecto. La respuesta correcta es: ${respuestaCorrectaTexto}`;
      if (preguntaActual.explicacion) {
          respuestaDiv.innerHTML += `<br>Explicación: ${preguntaActual.explicacion}`;
      }
      fallos++;
      setTimeout(() => {
          respuestaDiv.style.display = "none";
          cargarSiguientePregunta();
      }, 6000);
  }
  respuestaDiv.style.display = "block";

}
function saltar(){
    saltadas++;
    cargarSiguientePregunta();
}

//cargar siguiente pregunta
function cargarSiguientePregunta() {
  indicePregunta++;
  mostrarPregunta();
}
// Función para seleccionar 15 preguntas aleatorias
function obtenerPreguntasAleatorias(preguntas, cantidad = 40) {
  const preguntasCopia = [...preguntas]; // Copia para no modificar el original

  // Fisher-Yates Shuffle
  for (let i = preguntasCopia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [preguntasCopia[i], preguntasCopia[j]] = [preguntasCopia[j], preguntasCopia[i]];
  }

  return preguntasCopia.slice(0, cantidad);
}

//cargar xml al cargar la ventana
window.onload = cargarXML;
