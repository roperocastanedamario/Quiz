let preguntas = [];
let preguntaActual = 0;
let puntuacion = 0;
let respuestaSeleccionada = null;
let respondida = false;
let quizActual = "";
const cantidadPreguntas = 10;

async function iniciarQuiz(quiz) {
    quizActual = quiz;

    try {
        const respuesta = await fetch("preguntas/" + quiz + ".json");
        if (!respuesta.ok) throw new Error("No se pudieron cargar las preguntas.");

        const datos = await respuesta.json();
        const preguntasMezcladas = [...datos.preguntas];

        // Mezcla las preguntas sin modificar el archivo original.
        for (let i = preguntasMezcladas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [preguntasMezcladas[i], preguntasMezcladas[j]] =
                [preguntasMezcladas[j], preguntasMezcladas[i]];
        }

        preguntas = preguntasMezcladas.slice(0, cantidadPreguntas);

        if (preguntas.length < cantidadPreguntas) {
            throw new Error("El cuestionario no contiene suficientes preguntas.");
        }

        preguntaActual = 0;
        puntuacion = 0;

        document.getElementById("menu").classList.add("oculto");
        document.getElementById("resultado").classList.add("oculto");
        document.getElementById("juego").classList.remove("oculto");
        document.getElementById("tituloQuiz").textContent = datos.titulo;

        mostrarPregunta();
    } catch (error) {
        alert("Error al cargar el cuestionario. Comprueba los archivos JSON y utiliza Live Server.");
        console.error(error);
    }
}

function mostrarPregunta() {
    const pregunta = preguntas[preguntaActual];
    respuestaSeleccionada = null;
    respondida = false;

    document.getElementById("progreso").textContent =
        `Pregunta ${preguntaActual + 1} de ${preguntas.length}`;
    document.getElementById("puntuacion").textContent =
        "Puntuación: " + puntuacion;
    document.getElementById("pregunta").textContent = pregunta.pregunta;

    const contenedor = document.getElementById("respuestas");
    contenedor.innerHTML = "";

    if (pregunta.imagen) {
        const imagen = document.createElement("img");
        imagen.src = "imagenes/" + pregunta.imagen;
        imagen.alt = "Imagen de la pregunta";
        contenedor.appendChild(imagen);
    }

    pregunta.respuestas.forEach((respuesta, indice) => {
        const boton = document.createElement("button");
        boton.textContent = respuesta;
        boton.className = "respuesta";
        boton.type = "button";
        boton.onclick = () => seleccionarRespuesta(indice);
        contenedor.appendChild(boton);
    });

    document.getElementById("pista").textContent = "";
    document.getElementById("pistaBtn").disabled = false;

    const confirmar = document.getElementById("confirmarBtn");
    confirmar.textContent = "Confirmar respuesta";
    confirmar.disabled = false;
}

function seleccionarRespuesta(indice) {
    if (respondida) return;
    respuestaSeleccionada = indice;

    document.querySelectorAll(".respuesta").forEach((boton, i) => {
        boton.classList.toggle("seleccionada", i === indice);
    });
}

function confirmarRespuesta() {
    if (respondida) {
        siguientePregunta();
        return;
    }

    if (respuestaSeleccionada === null) {
        alert("Selecciona una respuesta primero.");
        return;
    }

    respondida = true;
    const pregunta = preguntas[preguntaActual];
    const botones = document.querySelectorAll(".respuesta");

    botones.forEach((boton, indice) => {
        if (indice === pregunta.correcta) boton.classList.add("correcta");
        if (indice === respuestaSeleccionada && indice !== pregunta.correcta) {
            boton.classList.add("incorrecta");
        }
        boton.disabled = true;
    });

    if (respuestaSeleccionada === pregunta.correcta) puntuacion++;

    document.getElementById("puntuacion").textContent =
        "Puntuación: " + puntuacion;
    document.getElementById("pistaBtn").disabled = true;
    document.getElementById("confirmarBtn").textContent =
        preguntaActual === preguntas.length - 1 ? "Ver resultado" : "Siguiente pregunta";
}

function siguientePregunta() {
    preguntaActual++;
    if (preguntaActual < preguntas.length) {
        mostrarPregunta();
    } else {
        mostrarResultado();
    }
}

function mostrarPista() {
    if (respondida) return;
    const pista = preguntas[preguntaActual].pista;
    document.getElementById("pista").textContent =
        pista || "No hay pista disponible para esta pregunta.";
}

function mostrarResultado() {
    document.getElementById("juego").classList.add("oculto");
    document.getElementById("resultado").classList.remove("oculto");
    document.getElementById("nota").textContent =
        `Has conseguido ${puntuacion} de ${preguntas.length} puntos.`;
    document.getElementById("nombre").value = "";
}

function guardarRanking() {
    const nombre = document.getElementById("nombre").value.trim();
    if (!nombre) {
        alert("Introduce tu nombre.");
        return;
    }

    let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
    ranking.push({
        nombre: nombre,
        puntuacion: puntuacion,
        quiz: quizActual
    });

    ranking.sort((a, b) => b.puntuacion - a.puntuacion);
    localStorage.setItem("ranking", JSON.stringify(ranking.slice(0, 10)));
    alert("¡Puntuación guardada!");
    volverMenu();
}

function cargarRanking() {
    const ranking = JSON.parse(localStorage.getItem("ranking")) || [];
    const contenedor = document.getElementById("ranking");
    contenedor.innerHTML = "";

    if (ranking.length === 0) {
        contenedor.textContent = "Todavía no hay puntuaciones.";
        return;
    }

    ranking.forEach((jugador, indice) => {
        const elemento = document.createElement("p");
        elemento.textContent =
            `${indice + 1}. ${jugador.nombre} - ${jugador.puntuacion}/10 (${jugador.quiz})`;
        contenedor.appendChild(elemento);
    });
}

function volverMenu() {
    document.getElementById("resultado").classList.add("oculto");
    document.getElementById("juego").classList.add("oculto");
    document.getElementById("menu").classList.remove("oculto");
    cargarRanking();
}

cargarRanking();
