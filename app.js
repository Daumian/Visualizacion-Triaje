let triageStack = [];
let procesando = false;
let proximoPaciente = null; // Variable para guardar al que viene


// Definimos los rangos para saber quién va antes que quién
const NIVELES = {
    "ROJO": 40,
    "NARANJA": 20,
    "AMARILLO": 10,
    "VERDE": 3,
    "AZUL": 0
};

function obtenerColorTriage(score) {
    if (score >= NIVELES.ROJO) return { color: "#e74c3c", tag: "ROJO" };
    if (score >= NIVELES.NARANJA) return { color: "#e67e22", tag: "NARANJA" };
    if (score >= NIVELES.AMARILLO) return { color: "#f1c40f", tag: "AMARILLO" };
    if (score >= NIVELES.VERDE) return { color: "#2ecc71", tag: "VERDE" };
    return { color: "#3498db", tag: "AZUL" };
}

// Función para determinar datos basados en score
function obtenerInfoPorScore(score) {
    if (score >= NIVELES.ROJO) return { color: "#e74c3c", tag: "ROJO", prioridad: NIVELES.ROJO };
    if (score >= NIVELES.NARANJA) return { color: "#e67e22", tag: "NARANJA", prioridad: NIVELES.NARANJA };
    if (score >= NIVELES.AMARILLO) return { color: "#f1c40f", tag: "AMARILLO", prioridad: NIVELES.AMARILLO };
    if (score >= NIVELES.VERDE) return { color: "#2ecc71", tag: "VERDE", prioridad: NIVELES.VERDE };
    return { color: "#3498db", tag: "AZUL", prioridad: NIVELES.AZUL };
}



// 1. Esta función solo crea los datos de un paciente, no lo mete en la fila
function crearPacienteAleatorio() {
    const randomScore = Math.floor(Math.random() * 60);
    let info = { color: "#3498db", tag: "AZUL", prioridad: 0 };

    if (randomScore >= NIVELES.ROJO) info = { color: "#e74c3c", tag: "ROJO", prioridad: NIVELES.ROJO };
    else if (randomScore >= NIVELES.NARANJA) info = { color: "#e67e22", tag: "NARANJA", prioridad: NIVELES.NARANJA };
    else if (randomScore >= NIVELES.AMARILLO) info = { color: "#f1c40f", tag: "AMARILLO", prioridad: NIVELES.AMARILLO };
    else if (randomScore >= NIVELES.VERDE) info = { color: "#2ecc71", tag: "VERDE", prioridad: NIVELES.VERDE };

    return { score: randomScore, ...info };
}

// Pre-genera el paciente que se verá en el cuadro de "Siguiente"
function actualizarPreview() {
    const randomScore = Math.floor(Math.random() * 60);
    const info = obtenerInfoPorScore(randomScore);
    
    proximoPaciente = { score: randomScore, ...info };

    const preview = document.getElementById('next-patient-preview');
    preview.innerText = `SIGUIENTE: ${proximoPaciente.tag} (${proximoPaciente.score})`;
    preview.style.backgroundColor = proximoPaciente.color;
    preview.style.color = "white";
    preview.style.borderColor = "transparent";
}



// 3. Modificamos la función del botón
function generarCasoAleatorio() {
    // Si es la primera vez, generamos uno rápido
    if (!proximoPaciente) actualizarPreview();

    // Copiamos el paciente del preview a la fila
    const pacienteAEntrar = { ...proximoPaciente };
    
    // Lógica de inserción por prioridad
    let indexInsercion = triageStack.length;
    for (let i = 0; i < triageStack.length; i++) {
        if (pacienteAEntrar.prioridad > triageStack[i].prioridad) {
            indexInsercion = i;
            break;
        }
    }
    
    triageStack.splice(indexInsercion, 0, pacienteAEntrar);
    
    // Renovamos el preview para el FUTURO
    actualizarPreview();
    actualizarInterfazFila();

    if (!procesando) {
        procesando = true;
        iniciarProcesamiento();
    }
}

// Inicializar el primer preview al cargar la página
window.onload = actualizarPreview;

function actualizarInterfazFila() {
    const contenedor = document.getElementById('fila-container');
    contenedor.innerHTML = '';
    triageStack.forEach(caso => {
        const div = document.createElement('div');
        div.className = 'paciente-fila';
        div.style.backgroundColor = caso.color;
        // CORRECCIÓN: Usamos caso.tag que ya viene definido
        div.innerText = `${caso.tag} - SCORE: ${caso.score}`;
        contenedor.appendChild(div);
    });
}

function iniciarProcesamiento() {
    const progressBar = document.getElementById('progress-bar');
    const labelActual = document.getElementById('item-actual');
    const msInput = document.getElementById('ms-input');

    let tiempoDefinido = parseInt(msInput.value) || 2000;

    if (triageStack.length === 0) {
        procesando = false;
        labelActual.innerText = "RECEPCIÓN LIBRE";
        labelActual.style.color = "white";
        progressBar.style.transition = "none";
        progressBar.style.width = "0%";
        return;
    }

    const atendido = triageStack.shift(); 
    // CORRECCIÓN: Verificación de seguridad para evitar undefined
    const nombreNivel = atendido.tag || "PACIENTE";
    
    labelActual.innerText = `ATENDIENDO: ${nombreNivel} (${atendido.score})`;
    labelActual.style.color = atendido.color;

    progressBar.style.transition = "none";
    progressBar.style.width = "0%";
    void progressBar.offsetWidth; 

    progressBar.style.transition = `width ${tiempoDefinido}ms linear`;
    progressBar.style.width = "100%";

    actualizarInterfazFila();
    setTimeout(iniciarProcesamiento, tiempoDefinido);
}

// Arrancar el sistema
window.onload = actualizarPreview;