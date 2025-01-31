/******************************************************
 * Elementos del DOM
 ******************************************************/
const form = document.getElementById('calculator-form');
const chartCanvas = document.getElementById('savings-chart');
const summarySection = document.getElementById('summary');
const summaryInitial = document.getElementById('summary-initial');
const summaryContributed = document.getElementById('summary-contributed');
const summaryInterest = document.getElementById('summary-interest');
const summaryFinal = document.getElementById('summary-final');
const finalLevel = document.getElementById('final-level');

const resetBtn = document.getElementById('reset-btn');
const pdfBtn = document.getElementById('pdf-btn');

/******************************************************
 * Variables globales
 ******************************************************/
// Para mantener la instancia del gráfico y poder destruirla al recalcular
let savingsChart = null;

/******************************************************
 * Funciones principales
 ******************************************************/

/**
 * Calcula el crecimiento de los ahorros con interés compuesto.
 * @param {number} initial - Monto inicial
 * @param {number} monthly - Aportación mensual
 * @param {number} rate - Tasa de interés anual (en %)
 * @param {number} years - Número de años
 * @returns {number[]} Array con los montos acumulados al final de cada año
 */
function calculateSavings(initial, monthly, rate, years) {
  const monthlyRate = rate / 100 / 12; // Tasa mensual en decimal
  let balance = initial;
  const dataPoints = [balance]; // Guardamos el balance inicial en la posición 0

  for (let month = 1; month <= years * 12; month++) {
    // Añadimos la aportación mensual
    balance += monthly;
    // Aplicamos el interés sobre el balance
    balance += balance * monthlyRate;

    // Cada 12 meses (1 año), guardamos el balance
    if (month % 12 === 0) {
      dataPoints.push(balance);
    }
  }
  
  return dataPoints;
}

/**
 * Renderiza la gráfica usando Chart.js
 * @param {number[]} data - Array con montos anuales
 */
function renderChart(data) {
  // Si ya hay un gráfico anterior, lo destruimos
  if (savingsChart) {
    savingsChart.destroy();
  }

  // Creamos las etiquetas para el eje X (Año 0, Año 1, etc.)
  const labels = data.map((_, i) => `Año ${i}`);

  // Instanciamos la gráfica
  savingsChart = new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Ahorros acumulados (€)',
        data: data,
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        fill: true,
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Tiempo (años)'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Monto (€)'
          },
          beginAtZero: true
        }
      }
    }
  });
}

/**
 * Determina el nivel “divertido” en base al monto final
 * @param {number} finalAmount - Monto final acumulado
 * @returns {string} Mensaje del nivel
 */
function getFunLevel(finalAmount) {
  if (finalAmount < 10000) {
    return "🛴 Ahorros básicos... ¡pero ya es un comienzo!";
  } else if (finalAmount < 50000) {
    return "🔑 ¡Poco a poco! Quizás un coche de segunda mano.";
  } else if (finalAmount < 200000) {
    return "🏠 Piso en Oropesa incoming...";
  } else if (finalAmount < 500000) {
    return "🌞 Piso en Marbella. Chanclas, sol y sangría.";
  } else if (finalAmount < 1000000) {
    return "🏎️ Lambo en camino. ¡Vas con todo!";
  } else if (finalAmount < 5000000) {
    return "🛫 Jet privado desbloqueado. Vida de lujo.";
  } else {
    return "💰 Modo Florentino Pérez: ¡montas tu propio equipo de fútbol!";
  }
}

/**
 * Cambia el fondo del body dependiendo del monto final
 * @param {number} finalAmount
 */
function changeBackground(finalAmount) {
  if (finalAmount < 50000) {
    document.body.style.background = "linear-gradient(to bottom right, #FEE440, #FA8072)"; // Original
  } else if (finalAmount < 200000) {
    document.body.style.background = "linear-gradient(to bottom right, #ABEBC6, #58D68D)"; // Verde clarito
  } else if (finalAmount < 500000) {
    document.body.style.background = "linear-gradient(to bottom right, #7FB3D5, #5499C7)"; // Azul suave
  } else if (finalAmount < 1000000) {
    document.body.style.background = "linear-gradient(to bottom right, #F9E79F, #F4D03F)"; // Amarillo dorado
  } else if (finalAmount < 5000000) {
    document.body.style.background = "linear-gradient(to bottom right, #F5B7B1, #EC7063)"; // Rosa/rojo vibrante
  } else {
    document.body.style.background = "linear-gradient(to bottom right, #FFDF00, #FFD700)"; // Oro puro
  }
}

/******************************************************
 * Eventos
 ******************************************************/

// 1. Cuando se envía el formulario
form.addEventListener('submit', (event) => {
  event.preventDefault();

  // Obtenemos valores del formulario
  const initialAmount = parseFloat(document.getElementById('initial-amount').value);
  const monthlyContribution = parseFloat(document.getElementById('monthly-contribution').value);
  const interestRate = parseFloat(document.getElementById('interest-rate').value);
  const years = parseInt(document.getElementById('years').value);

  // Validaciones básicas
  if (isNaN(initialAmount) || initialAmount < 0) {
    alert("Por favor, ingresa un monto inicial válido (≥ 0).");
    return;
  }
  if (isNaN(monthlyContribution) || monthlyContribution < 0) {
    alert("Por favor, ingresa una aportación mensual válida (≥ 0).");
    return;
  }
  if (isNaN(interestRate) || interestRate < 0) {
    alert("Por favor, ingresa una tasa de interés anual válida (≥ 0).");
    return;
  }
  if (isNaN(years) || years < 1 || years > 100) {
    alert("Por favor, ingresa un número de años entre 1 y 100.");
    return;
  }

  // Calcular datos
  const savingsData = calculateSavings(initialAmount, monthlyContribution, interestRate, years);
  renderChart(savingsData);

  // Monto final (último valor del array)
  const finalAmount = savingsData[savingsData.length - 1];

  // Mostramos un resumen
  showSummary(initialAmount, monthlyContribution, years, finalAmount);

  // Cambiamos el fondo de la página en función del resultado
  changeBackground(finalAmount);
});

// 2. Botón para reiniciar formulario y gráfica
resetBtn.addEventListener('click', () => {
  // Limpiamos campos
  document.getElementById('initial-amount').value = "";
  document.getElementById('monthly-contribution').value = "";
  document.getElementById('interest-rate').value = "";
  document.getElementById('years').value = "";

  // Ocultamos el resumen
  summarySection.classList.add("hidden");

  // Restauramos el fondo
  document.body.style.background = "linear-gradient(to bottom right, #FEE440, #FA8072)";

  // Destruimos la gráfica
  if (savingsChart) {
    savingsChart.destroy();
    savingsChart = null;
  }
});

// 3. Botón para exportar a PDF
pdfBtn.addEventListener('click', () => {
  exportToPDF();
});

// 4. Acordeón FAQ
const accordions = document.querySelectorAll(".accordion");
accordions.forEach((acc) => {
  acc.addEventListener("click", function () {
    // Alternar la clase "active"
    this.classList.toggle("active");
    // Obtener el panel siguiente
    const panel = this.nextElementSibling;
    if (panel.style.maxHeight) {
      // Si está abierto, se cierra
      panel.style.maxHeight = null;
    } else {
      // Si está cerrado, se abre
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  });
});

/******************************************************
 * Funciones auxiliares
 ******************************************************/

/**
 * Muestra el resumen de resultados debajo de la gráfica
 */
function showSummary(initialAmount, monthlyContribution, years, finalAmount) {
  // Calculamos total aportado (aparte del inicial)
  const totalContributed = monthlyContribution * 12 * years;
  const interestEarned = finalAmount - (initialAmount + totalContributed);

  summaryInitial.textContent = `€${initialAmount.toFixed(2)}`;
  summaryContributed.textContent = `€${totalContributed.toFixed(2)}`;
  summaryInterest.textContent = `€${interestEarned.toFixed(2)}`;
  summaryFinal.textContent = `€${finalAmount.toFixed(2)}`;

  finalLevel.textContent = getFunLevel(finalAmount);

  // Mostramos el resumen
  summarySection.classList.remove("hidden");
}

/**
 * Exporta los resultados a PDF usando jsPDF
 */
function exportToPDF() {
  // Usamos la versión modular de jsPDF (2.5.1). Obtenemos el namespace
  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF();

  // Título
  pdf.setFontSize(16);
  pdf.text("Resumen de Ahorros", 10, 10);

  // Datos
  pdf.setFontSize(12);
  pdf.text(`Monto inicial: ${summaryInitial.textContent}`, 10, 20);
  pdf.text(`Total aportado: ${summaryContributed.textContent}`, 10, 30);
  pdf.text(`Intereses ganados: ${summaryInterest.textContent}`, 10, 40);
  pdf.text(`Monto final: ${summaryFinal.textContent}`, 10, 50);
  pdf.text(`Nivel: ${finalLevel.textContent}`, 10, 60);

  // Guardamos el archivo
  pdf.save("resumen_ahorros.pdf");
}
