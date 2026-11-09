// Inicializar el Web Worker
const worker = new Worker('worker.js');

// Elementos del DOM
const fileInput = document.getElementById('csvFileInput');
const dropZone = document.getElementById('dropZone');
const statusBadge = document.getElementById('statusBadge');
const statusText = document.getElementById('statusText');
const tableWrapper = document.getElementById('tableWrapper');
const tableContainer = document.getElementById('tableContainer');

// Drag & Drop Feedback Visual
['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
    });
});

// Evento de selección de archivo
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
});

function processFile(file) {
    if (!file.name.endsWith('.csv')) {
        updateStatus('error', 'Por favor, selecciona un archivo válido con extensión .csv');
        return;
    }

    updateStatus('loading', `Leyendo archivo "${file.name}"...`);
    tableWrapper.classList.add('hidden');

    const reader = new FileReader();
    
    reader.onload = (event) => {
        updateStatus('loading', 'Enviando datos al Web Worker...');
        // Enviar el contenido del CSV al worker en segundo plano
        worker.postMessage(event.target.result);
    };

    reader.onerror = () => {
        updateStatus('error', 'Error al leer el archivo desde el disco.');
    };

    reader.readAsText(file);
}

// Recibir respuesta desde el Web Worker
worker.onmessage = (e) => {
    const { success, data, message } = e.data;

    if (!success || !data || data.length === 0) {
        updateStatus('error', message || 'No se pudieron extraer datos del archivo.');
        return;
    }

    renderTable(data);
    const totalRows = data.length - 1; // Descontar encabezados
    updateStatus('success', `✓ Procesado con éxito (${totalRows} registros cargados)`);
};

// Renderizar la tabla dinámica HTML
function renderTable(data) {
    tableContainer.innerHTML = '';
    const table = document.createElement('table');
    
    // Encabezados (Fila 0)
    const headerRow = data[0];
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    
    headerRow.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText.trim();
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    // Cuerpo (Filas restantes)
    const tbody = document.createElement('tbody');
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row.length === 1 && row[0].trim() === '') continue; // Ignorar filas vacías

        const tr = document.createElement('tr');
        row.forEach(cellText => {
            const td = document.createElement('td');
            td.textContent = cellText.trim();
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    }
    
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    tableWrapper.classList.remove('hidden');
}

// Helper para cambiar estados del badge visual
function updateStatus(type, message) {
    statusBadge.className = `status-badge status-${type}`;
    statusText.textContent = message;
}