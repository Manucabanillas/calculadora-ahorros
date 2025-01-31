// Obtenemos las referencias a los elementos del DOM
const form = document.getElementById('calculator-form');
const chartCanvas = document.getElementById('savings-chart');
const resultMessage = document.getElementById('resultMessage');

// Variable para almacenar la instancia del gráfico y poder actualizarla
let savingsChart = null;

/**
 * Función para calcular el crecimiento de los ahorros con interés compuesto.
 * @param {number} initial - Monto inicial
 * @param {number} monthly - Aportación mensual
 * @param {number} rate - Tasa de interés anual (en %)
 * @param {number} years - Número de años
 * @returns {number[]} Array con los montos acumulados al final de cada año
 */
function calculateSavings(initial, monthly, rate, years) {
  const monthlyRate = rate / 100 / 12; // Tasa mensual en decimal
  let balance = initial;
  const dataPoints = [balance];

  for (let month = 1; month <= years * 12; month++) {
    // Añadimos la aportación mensual
    balance += monthly;
    // Aplicamos el interés sobre el balance
    balance += balance * monthlyRate;

    // Cada 12 meses (1 año), guardamos el balance en dataPoints
    if (month % 12 === 0) {
      dataPoints.push(balance);
    }
  }
  
  return dataPoints;
}

/**
 * Función para renderizar la gráfica usando Chart.js
 * @param {number[]} data - Array con los montos anuales
 */
function renderChart(data) {
  // Si ya existe un gráfico anterior, lo destruimos para generar uno nuevo
  if (savingsChart) {
    savingsChart.destroy();
  }
  
  // Etiquetas para el eje X: del año 0 al año n
  const labels = data.map((_, index) => `Año ${index}`);

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
 * Función para determinar el "nivel divertido" en base al monto final
 * @param {number} finalAmount - Cantidad final de ahorro
 * @returns {string} Mensaje divertido
 */
function getFunLevel(finalAmount) {
  if (finalAmount < 50000) {
    return "¡Te quedas en casa de tus padres! O pillas un patinete eléctrico. 🏠";
  } else if (finalAmount < 200000) {
    return "Piso en Oropesa incoming... 🎉";
  } else if (finalAmount < 500000) {
    return "¡Piso en Marbella! Sacando sangría y chanclas. 🏖️";
  } else if (finalAmount < 1000000) {
    return "¡Lambo en camino! 🏎️💨";
  } else {
    return "¡Florentino Pérez mode! Te montas tu propio club de fútbol. ⚽💰";
  }
}

/**
 * Manejador del evento 'submit' del formulario
 */
form.addEventListener('submit', (event) => {
  event.preventDefault();

  // Capturamos los valores del formulario
  const initialAmount = parseFloat(document.getElementById('initial-amount').value);
  const monthlyContribution = parseFloat(document.getElementById('monthly-contribution').value);
  const interestRate = parseFloat(document.getElementById('interest-rate').value);
  const years = parseInt(document.getElementById('years').value);

  // Calculamos los montos anuales
  const savingsData = calculateSavings(initialAmount, monthlyContribution, interestRate, years);
  
  // Renderizamos la gráfica
  renderChart(savingsData);

  // Obtenemos la cantidad final (último valor del array)
  const finalAmount = savingsData[savingsData.length - 1];

  // Mostramos mensaje según el nivel
  const message = getFunLevel(finalAmount);
  resultMessage.textContent = `Nivel alcanzado: ${message}`;
});

