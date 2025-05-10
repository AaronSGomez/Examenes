let seleccion = [];
let indicePregunta = 0;
let aciertos = 0;
let fallos = 0;
let saltadas = 0;
let cantidadPreguntas = 0;
let respuestasIncorrectas = [];
let preguntasSaltadas = [];

// Almacena la ruta XML activa
let xmlSeleccionado = "";
let tituloExamen = "";

// Inicia el examen al seleccionar un botón
function iniciarExamen(xmlFile, titulo) {
  xmlSeleccionado = `./xml/${xmlFile}`;
  tituloExamen = titulo;

  // Reset
  seleccion = [];
  indicePregunta = 0;
  aciertos = 0;
  fallos = 0;
  saltadas = 0;
  respuestasIncorrectas = [];
  preguntasSaltadas = [];

  // Mostrar examen y ocultar menú
  document.getElementById("menu-principal").style.display = "none";
  document.getElementById("zona-examen").style.display = "block";
  document.getElementById("titulo-examen").textContent = `Examen de ${titulo}`;

  cargarXML();
}

function mostrarMenu() {
  document.getElementById("menu-principal").style.display = "block";
  document.getElementById("zona-examen").style.display = "none";
}

// Carga y parsea el XML
async function cargarXML() {
  const response = await fetch(xmlSeleccionado);
  const text = await response.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, "text/xml");

  const preguntas = Array.from(xmlDoc.getElementsByTagName("pregunta")).map(p => ({
    enunciado: p.getElementsByTagName("enunciado")[0]?.textContent.trim() ?? "",
    A: p.getElementsByTagName("A")[0]?.textContent.trim() ?? "",
    B: p.getElementsByTagName("B")[0]?.textContent.trim() ?? "",
    C: p.getElementsByTagName("C")[0]?.textContent.trim() ?? "",
    D: p.getElementsByTagName("D")[0]?.textContent.trim() ?? "",
    respuestaCorrecta: p.getElementsByTagName("respuesta_correcta")[0]?.textContent.trim() ?? "",
    explicacion: p.getElementsByTagName("respuesta_correcta")[0]?.getAttribute("explicacion") ?? ""
  }));

  cantidadPreguntas = preguntas.length;
  seleccion = obtenerPreguntasAleatorias(preguntas);
  mostrarPregunta();
}

function mostrarPregunta() {
  if (indicePregunta >= seleccion.length) {
    let marcador = (aciertos * 0.25) - (fallos * 0.08);
    document.getElementById("pregunta-container").innerHTML = `
      <h2>Juego terminado! Nota obtenida: ${marcador.toFixed(2)}</h2>
      <h2>Aciertos: ${aciertos}</h2>
      <h2>Fallos: ${fallos}</h2>
      <h2>No respondidas: ${saltadas}</h2>
      <button onclick="mostrarRespuestasIncorrectas()">Ver respuestas incorrectas</button>
    `;
    document.getElementById("respuesta").style.display = "none";
    return;
  }

  const preguntaActual = seleccion[indicePregunta];
  let opcionesHTML = "";

  ['A', 'B', 'C', 'D'].forEach(letra => {
    const textoOpcion = preguntaActual[letra];
    opcionesHTML += `<li><button onclick="verificarRespuesta('${letra}')">${textoOpcion}</button></li>`;
  });

  document.getElementById("pregunta-container").innerHTML = `
    <p>${preguntaActual.enunciado}</p>
    <ul>${opcionesHTML}
      <li><button onclick="saltar()">Dejar sin contestar</button></li>
    </ul>
    <p>Pregunta ${indicePregunta + 1} de 40. Preguntas XML total: ${cantidadPreguntas}</p>
  `;

  Prism.highlightAll(); // Para resaltar código si lo hay
}

function verificarRespuesta(letraSeleccionada) {
  const preguntaActual = seleccion[indicePregunta];
  const letraCorrecta = preguntaActual.respuestaCorrecta;
  const respuestaDiv = document.getElementById("respuesta");

  if (letraSeleccionada === letraCorrecta) {
    aciertos++;
    respuestaDiv.innerHTML = `¡Correcto!`;
  } else {
    fallos++;
    respuestaDiv.innerHTML = `Incorrecto.`;
    respuestasIncorrectas.push({
      enunciado: preguntaActual.enunciado,
      opciones: { ...preguntaActual },
      seleccionUsuario: letraSeleccionada,
      respuestaCorrecta: letraCorrecta,
      explicacion: preguntaActual.explicacion
    });
  }

  respuestaDiv.style.display = "block";
  setTimeout(() => {
    respuestaDiv.style.display = "none";
    cargarSiguientePregunta();
  }, 2000);
}

function cargarSiguientePregunta() {
  indicePregunta++;
  mostrarPregunta();
}

function saltar() {
  const preguntaActual = seleccion[indicePregunta];
  preguntasSaltadas.push({
    enunciado: preguntaActual.enunciado,
    opciones: { ...preguntaActual },
    respuestaCorrecta: preguntaActual.respuestaCorrecta,
    explicacion: preguntaActual.explicacion
  });
  saltadas++;
  cargarSiguientePregunta();
}

function obtenerPreguntasAleatorias(preguntas, cantidad = 40) {
  const copia = [...preguntas];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, cantidad);
}

function mostrarRespuestasIncorrectas() {
  let html = "";

  if (respuestasIncorrectas.length > 0) {
    html += "<h2>Respuestas incorrectas:</h2>";
    respuestasIncorrectas.forEach((item, i) => {
      html += `<div style="margin-bottom: 20px;">
        <div class="enunciado">${i + 1}. ${item.enunciado}</div>
        <ul class="resultados">`;
      ['A', 'B', 'C', 'D'].forEach(letra => {
        const texto = item.opciones[letra];
        let estilo = "";
        if (letra === item.respuestaCorrecta) estilo = "color: green; font-weight: bold;";
        else if (letra === item.seleccionUsuario) estilo = "color: red;";
        html += `<li style="${estilo}">${letra}: ${texto}</li>`;
      });
      html += `</ul>`;
      if (item.explicacion) {
        html += `<div class="explicacion"><em>Explicación:</em> ${item.explicacion}</div>`;
      }
      html += `</div>`;
    });
  }

  if (preguntasSaltadas.length > 0) {
    html += "<h2>Preguntas no contestadas:</h2>";
    preguntasSaltadas.forEach((item, i) => {
      html += `<div style="margin-bottom: 20px;">
        <div class="enunciado">${i + 1}. ${item.enunciado}</div>
        <ul class="resultados">`;
      ['A', 'B', 'C', 'D'].forEach(letra => {
        const texto = item.opciones[letra];
        let estilo = "";
        if (letra === item.respuestaCorrecta) estilo = "color: green; font-weight: bold;";
        html += `<li style="${estilo}">${letra}: ${texto}</li>`;
      });
      html += `</ul>`;
      if (item.explicacion) {
        html += `<div class="explicacion"><em>Explicación:</em> ${item.explicacion}</div>`;
      }
      html += `</div>`;
    });
  }

  if (!html) {
    html = "<p>¡No cometiste errores ni dejaste preguntas sin contestar!</p>";
  }

  document.getElementById("pregunta-container").innerHTML = html;
  document.getElementById("respuesta").style.display = "none";
}
