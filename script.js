document.getElementById("food-form").addEventListener("submit", addFood);

let purchases = JSON.parse(localStorage.getItem('purchases')) || []; // Cargar desde LocalStorage o iniciar vacío

// Cargar las compras al cargar la página
window.onload = function() {
    updateTableByMonth();
    updateMonthlySummary();
}

function addFood(e) {
    e.preventDefault();

    // Capturar valores del formulario
    const fecha = document.getElementById("fecha").value;
    const producto = document.getElementById("producto").value;
    const precio = parseFloat(document.getElementById("precio").value);
    const cantidad = parseInt(document.getElementById("cantidad").value);
    const comercio = document.getElementById("comercio").value;
    const categoria = document.getElementById("categoria").value;
    const moneda = document.getElementById("moneda").value;  // Nueva moneda
    const total = precio * cantidad;

    // Crear un objeto para la compra
    const compra = { fecha, producto, precio, cantidad, total, comercio, categoria, moneda };
    purchases.push(compra);

    // Guardar en LocalStorage
    localStorage.setItem('purchases', JSON.stringify(purchases));

    // Actualizar la tabla por meses
    updateTableByMonth();
    
    // Actualizar el resumen mensual
    updateMonthlySummary();
}

function updateTableByMonth() {
    const tableBody = document.querySelector("#food-table tbody");
    tableBody.innerHTML = "";
    const chartsContainer = document.getElementById("charts-container");
    chartsContainer.innerHTML = ""; // Limpiar el contenedor de gráficos

    // Agrupar compras por mes
    const comprasPorMes = {};

    purchases.forEach(purchase => {
        const mes = purchase.fecha.substring(0, 7); // Obtener año-mes
        if (!comprasPorMes[mes]) {
            comprasPorMes[mes] = [];
        }
        comprasPorMes[mes].push(purchase);
    });

    // Mostrar las compras separadas por meses
    for (const mes in comprasPorMes) {
        const monthHeader = document.createElement("tr");
        monthHeader.innerHTML = `<th colspan="7">${mes}</th>`;
        tableBody.appendChild(monthHeader);

        comprasPorMes[mes].forEach(purchase => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${purchase.fecha}</td>
                <td>${purchase.producto}</td>
                <td>${purchase.precio.toFixed(2)} ${purchase.moneda}</td> <!-- Moneda -->
                <td>${purchase.cantidad}</td>
                <td>${purchase.total.toFixed(2)} ${purchase.moneda}</td> <!-- Moneda -->
                <td>${purchase.comercio}</td>
                <td class="${purchase.categoria.toLowerCase()}">${purchase.categoria}</td>
            `;
            tableBody.appendChild(row);
        });

        // Crear un nuevo canvas para el gráfico del mes
        const canvas = document.createElement("canvas");
        canvas.id = `chart-${mes}`;
        canvas.width = 400;
        canvas.height = 200;
        chartsContainer.appendChild(canvas);

        // Generar gráfico para el mes
        generateChart(mes);
    }
}

function updateMonthlySummary() {
    const summary = document.getElementById("monthly-summary");
    summary.innerHTML = "";

    // Calcular el gasto total por mes
    const gastosPorMes = {};

    purchases.forEach(purchase => {
        const mes = purchase.fecha.substring(0, 7);  // Obtener año y mes (YYYY-MM)
        if (!gastosPorMes[mes]) {
            gastosPorMes[mes] = 0;
        }
        gastosPorMes[mes] += purchase.total;
    });

    // Mostrar resumen por mes
    for (const mes in gastosPorMes) {
        const div = document.createElement("div");
        div.innerHTML = `<strong>${mes}:</strong> $${gastosPorMes[mes].toFixed(2)}`;
        summary.appendChild(div);
    }
}

function agregarOthers() {
    const nuevoProducto = document.getElementById("nuevoProducto").value;
    const nuevoComercio = document.getElementById("nuevoComercio").value;
    const nuevaCategoria = document.getElementById("nuevaCategoria").value;
    
    if (nuevoProducto) {
        const productoSelect = document.getElementById("producto");
        const option = document.createElement("option");
        option.value = nuevoProducto;
        option.text = nuevoProducto;
        productoSelect.add(option);
        alert(`Producto "${nuevoProducto}" agregado.`);
        document.getElementById("nuevoProducto").value = ''; // Limpiar campo
    }
    if (nuevoComercio) {
        const comercioSelect = document.getElementById("comercio");
        const option = document.createElement("option");
        option.value = nuevoComercio;
        option.text = nuevoComercio;
        comercioSelect.add(option);
        alert(`Comercio "${nuevoComercio}" agregado.`);
        document.getElementById("nuevoComercio").value = ''; // Limpiar campo
    }
    if (nuevaCategoria) {
        const categoriaSelect = document.getElementById("categoria");
        const option = document.createElement("option");
        option.value = nuevaCategoria;
        option.text = nuevaCategoria;
        categoriaSelect.add(option);
        alert(`Categoría "${nuevaCategoria}" agregada.`);
        document.getElementById("nuevaCategoria").value = ''; // Limpiar campo
    }
}

// Excel
document.getElementById("download-xlsx").addEventListener("click", function() {
    const month = prompt("Ingrese el mes (formato YYYY-MM) para descargar:");
    const filteredPurchases = purchases.filter(p => p.fecha.substring(0, 7) === month);

    if (filteredPurchases.length === 0) {
        alert("No hay datos para el mes especificado.");
        return;
    }

    const ws_data = filteredPurchases.map(purchase => [
        purchase.fecha, purchase.producto, purchase.precio, purchase.cantidad, purchase.total, purchase.comercio, purchase.categoria, purchase.moneda
    ]);
    
    // Encabezados
    ws_data.unshift(["Fecha", "Producto", "Precio", "Cantidad", "Total", "Comercio", "Categoría", "Moneda"]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, month);

    XLSX.writeFile(wb, `gastos_${month}.xlsx`);
});

// Gráficos
// Función para generar gráficos
function generateChart(month) {
    const filteredPurchases = purchases.filter(p => p.fecha.substring(0, 7) === month);

    const labels = filteredPurchases.map(p => p.producto);
    const data = filteredPurchases.map(p => p.total);

    const ctx = document.getElementById(`chart-${month}`).getContext('2d');
    new Chart(ctx, {
        type: 'pie', // Cambiado a 'pie' para gráfico circular
        data: {
            labels: labels,
            datasets: [{
                label: `Gastos de ${month}`,
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `Gastos de ${month}`
                }
            }
        }
    });
}


// Modal

// Obtener el modal
const modal = document.getElementById("productModal");

// Obtener el botón que abre el modal
const openModalButton = document.getElementById("openModal");

// Obtener el elemento <span> que cierra el modal
const closeModalButton = document.getElementById("closeModal");

// Cuando el usuario hace clic en el botón, abre el modal 
openModalButton.onclick = function() {
    modal.style.display = "block";
}

// Cuando el usuario hace clic en <span> (x), cierra el modal
closeModalButton.onclick = function() {
    modal.style.display = "none";
}

// Cuando el usuario hace clic en cualquier parte fuera del modal, lo cierra
window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}
