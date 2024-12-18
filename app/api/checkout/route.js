import { setCorsHeaders } from '../cors';  // Importamos el middleware CORS
import nodemailer from 'nodemailer';

// Función de validación (como antes)
function validatePaymentData(paymentData) {
    // Validación (ya explicada anteriormente)
    // ...
    return { valid: true };
}

// Configurar el transporte para Nodemailer
async function sendReceiptEmail(paymentData, transactionId) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: paymentData.userInfo.email,
        subject: 'Boleta Electrónica - Pipetzza',
        html: `
            <h1>Gracias por tu compra en Pipetzza</h1>
            <p>Estimado(a) ${paymentData.userInfo.name},</p>
            <p>Tu pago ha sido procesado exitosamente. Aquí tienes los detalles de tu compra:</p>
            <ul>
                <li><strong>ID de la transacción:</strong> ${transactionId}</li>
                <li><strong>Total pagado:</strong> $${paymentData.total} CLP</li>
                <li><strong>Método de pago:</strong> ${paymentData.paymentMethod}</li>
                <li><strong>Método de entrega:</strong> ${paymentData.deliveryMethod === 'delivery' ? 'Entrega a domicilio' : 'Recoger en tienda'}</li>
            </ul>
            ${paymentData.deliveryMethod === 'delivery' ? `
                <p><strong>Dirección de entrega:</strong> ${paymentData.deliveryAddress.street}, ${paymentData.deliveryAddress.number}, ${paymentData.deliveryAddress.city}</p>
            ` : `
                <p><strong>Tienda seleccionada:</strong> ${paymentData.selectedStore.name}, ${paymentData.selectedStore.address}</p>
            `}
            <p>Gracias por tu compra y esperamos que disfrutes tu pizza.</p>
            <p>Atentamente,<br>El equipo de Pipetzza</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo enviado exitosamente');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
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

    // Enviar el correo de boleta
    await sendReceiptEmail(paymentData, transactionId);

    const response = new Response(
        JSON.stringify({
            message: 'Pago simulado exitoso y correo enviado',
            status: 'success',
            transactionId: transactionId, // ID simulado
            transactionTimestamp: transactionTimestamp,
            totalAmount: paymentData.total, // El monto real
            currency: 'CLP', // Moneda simulada
            deliveryMethod: paymentData.deliveryMethod, // Método de entrega
            deliveryAddress: paymentData.deliveryAddress || paymentData.selectedStore // Dirección de entrega o tienda seleccionada
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
