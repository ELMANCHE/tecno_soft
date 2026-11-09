// Escuchar mensajes provenientes del hilo principal (main.js)
self.onmessage = function(e) {
    const csvRawContent = e.data;
    
    try {
        // Ejecutar parseo pesado en segundo plano
        const parsedRows = parseCSV(csvRawContent);
        
        // Devolver respuesta exitosa al hilo principal
        self.postMessage({
            success: true,
            data: parsedRows
        });
    } catch (error) {
        self.postMessage({
            success: false,
            message: 'Error al procesar la estructura del CSV.'
        });
    }
};

/**
 * Función encargada de parsear las líneas de texto del archivo CSV.
 */
function parseCSV(text) {
    // Dividir por saltos de línea (\n o \r\n)
    const lines = text.split(/\r\n|\n/);
    const result = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            // Separar columnas por comas
            const cells = line.split(',');
            result.push(cells);
        }
    }
    
    return result;
}