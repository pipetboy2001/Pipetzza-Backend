import { setCorsHeaders } from '../cors';  // Importamos el middleware CORS

export async function POST(req) {
    const { total } = await req.json();

    // Simulamos un pago con el precio real, pero no hacemos transacciones reales
    if (total > 0) {
        const response = new Response(
            JSON.stringify({
                message: 'Pago simulado exitoso',
                status: 'success',
                transactionId: '1234567890', // ID simulado
                totalAmount: total, // Enviar el monto real
            }),
            { status: 200 }
        );

        // Aplicar los encabezados CORS
        return setCorsHeaders(response);
    } else {
        const response = new Response(
            JSON.stringify({
                message: 'Error en el pago. El monto debe ser mayor a 0.',
                status: 'failed',
            }),
            { status: 400 }
        );

        // Aplicar los encabezados CORS
        return setCorsHeaders(response);
    }
}

// Agregar soporte para preflight OPTIONS (opcional)
export async function OPTIONS() {
    const response = new Response(null, { status: 200 });
    return setCorsHeaders(response); // Agregar encabezados CORS
}
