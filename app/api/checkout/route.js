// app/api/checkout/route.js
export async function POST(req) {
    const { total } = await req.json();

    // Simulamos un pago con el precio real, pero no hacemos transacciones reales
    if (total > 0) {
        return new Response(
            JSON.stringify({
                message: 'Pago simulado exitoso',
                status: 'success',
                transactionId: '1234567890', // ID simulado
                totalAmount: total, // Enviar el monto real
            }),
            { status: 200 }
        );
    } else {
        return new Response(
            JSON.stringify({
                message: 'Error en el pago. El monto debe ser mayor a 0.',
                status: 'failed',
            }),
            { status: 400 }
        );
    }
}
