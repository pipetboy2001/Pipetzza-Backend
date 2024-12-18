import { setCorsHeaders } from '../cors';  // Importamos el middleware CORS

// Función de validación para los datos recibidos
function validatePaymentData(paymentData) {
    // Verificar que todos los campos estén presentes
    if (!paymentData.total || paymentData.total <= 0) {
        return { valid: false, message: "El monto total debe ser mayor a 0." };
    }
    if (!paymentData.paymentMethod || !['tarjeta', 'paypal', 'efectivo'].includes(paymentData.paymentMethod)) {
        return { valid: false, message: "Método de pago inválido." };
    }
    if (!paymentData.deliveryMethod || !['delivery', 'pickup'].includes(paymentData.deliveryMethod)) {
        return { valid: false, message: "Método de entrega inválido." };
    }
    if (!paymentData.userInfo || !paymentData.userInfo.email || !paymentData.userInfo.name || !paymentData.userInfo.phone) {
        return { valid: false, message: "Faltan datos del usuario (email, nombre o teléfono)." };
    }
    if (!paymentData.cardDetails || !paymentData.cardDetails.cardNumber || !paymentData.cardDetails.expiryDate || !paymentData.cardDetails.cvv) {
        return { valid: false, message: "Faltan detalles de la tarjeta (número, fecha de vencimiento o CVV)." };
    }
    if (!/^\d{16}$/.test(paymentData.cardDetails.cardNumber)) {
        return { valid: false, message: "El número de la tarjeta debe tener 16 dígitos." };
    }
    if (!/^\d{2}\/\d{2}$/.test(paymentData.cardDetails.expiryDate)) {
        return { valid: false, message: "La fecha de vencimiento debe tener el formato MM/AA." };
    }
    if (!/^\d{3}$/.test(paymentData.cardDetails.cvv)) {
        return { valid: false, message: "El código CVV debe tener 3 dígitos." };
    }
    if (!paymentData.deliveryAddress || !paymentData.deliveryAddress.street || !paymentData.deliveryAddress.number || !paymentData.deliveryAddress.city || !paymentData.deliveryAddress.postalCode) {
        return { valid: false, message: "Faltan datos de la dirección de entrega." };
    }
    return { valid: true };
}

export async function POST(req) {
    // Obtener los datos de la solicitud
    const paymentData = await req.json();

    // Validar los datos de la transacción
    const validation = validatePaymentData(paymentData);
    if (!validation.valid) {
        // Si los datos no son válidos, devolver un error con el mensaje
        const response = new Response(
            JSON.stringify({
                message: validation.message,
                status: 'failed'
            }),
            { status: 400 }
        );
        return setCorsHeaders(response);
    }

    // Simulación de pago exitoso
    const transactionId = `TX${Math.floor(Math.random() * 1000000000)}`;
    const transactionTimestamp = new Date().toISOString();

    const response = new Response(
        JSON.stringify({
            message: 'Pago simulado exitoso',
            status: 'success',
            transactionId: transactionId, // ID simulado
            transactionTimestamp: transactionTimestamp,
            totalAmount: paymentData.total, // El monto real
            currency: 'CLP', // Moneda simulada
            deliveryAddress: paymentData.deliveryAddress // Agregar la dirección de entrega
        }),
        { status: 200 }
    );

    // Aplicar los encabezados CORS
    return setCorsHeaders(response);
}

// Agregar soporte para preflight OPTIONS (opcional)
export async function OPTIONS() {
    const response = new Response(null, { status: 200 });
    return setCorsHeaders(response); // Agregar encabezados CORS
}
