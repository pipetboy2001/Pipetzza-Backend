export function setCorsHeaders(response) {
    // Agregar los encabezados CORS a la respuesta
    response.headers.set('Access-Control-Allow-Origin', '*'); // Permite solicitudes desde cualquier origen
    response.headers.set('Access-Control-Allow-Origin', 'https://pipetzza.vercel.app');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Métodos permitidos
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type'); // Encabezados permitidos
    return response;
}
