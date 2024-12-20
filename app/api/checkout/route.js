import { setCorsHeaders } from '../cors';  // Importamos el middleware CORS
import nodemailer from 'nodemailer';

// Función de validación (como antes)
function validatePaymentData(paymentData) {
    if (!paymentData.total || paymentData.total <= 0) {
        return { valid: false, message: "El monto total debe ser mayor a 0." };
    }

    // Validar datos del usuario
    if (!paymentData.userInfo || !paymentData.userInfo.email || !paymentData.userInfo.name || !paymentData.userInfo.phone) {
        return { valid: false, message: "Faltan datos del usuario (nombre, email o teléfono)." };
    }

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

    // Generar la tabla de productos
    const productRows = (paymentData.carrito || []).map(item => `
        <tr>
            <td>${item.quantity}</td>
            <td>${item.title}</td>
            <td>$${item.price}</td>
        </tr>
    `).join('');


    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: paymentData.userInfo.email,
        subject: 'Boleta Electrónica - Pipetzza',
        html: `
            <div style="text-align: center;">
                <img src="https://i.imgur.com/D1GXxkt.png" alt="Logo Pipetzza" style="width: 150px;"/>
            </div>

            <p><strong>RUT de la empresa:</strong> 12.345.678-9</p>
            <p><strong>Restaurant - Autoservicio</strong></p>

            <h2>Boleta Electrónica N° ${transactionId}</h2>

            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Hora:</strong> ${new Date().toLocaleTimeString()}</p>

            <hr/>

            <h3>Detalles de tu compra:</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="text-align: left;">Cantidad</th>
                        <th style="text-align: left;">Producto</th>
                        <th style="text-align: left;">Valor</th>
                    </tr>
                </thead>
                <tbody>
                    ${productRows}
                </tbody>
            </table>

            <hr/>

            <p><strong>Neto:</strong> $${(paymentData.total * 0.84).toFixed(2)}</p>
            <p><strong>IVA (16%):</strong> $${(paymentData.total * 0.16).toFixed(2)}</p>
            <p><strong>Total:</strong> $${paymentData.total.toFixed(2)}</p>

            <hr/>

            <p><strong>Método de pago:</strong> ${paymentData.paymentMethod}</p>
            <p><strong>Método de entrega:</strong> ${paymentData.deliveryMethod === 'delivery' ? 'Entrega a domicilio' : 'Recoger en tienda'}</p>
            
            ${paymentData.deliveryMethod === 'delivery' ? `
                <p><strong>Dirección de entrega:</strong> ${paymentData.deliveryAddress.street}, ${paymentData.deliveryAddress.number}, ${paymentData.deliveryAddress.city}</p>
            ` : `
                <p><strong>Tienda seleccionada:</strong> ${paymentData.selectedStore.name}, ${paymentData.selectedStore.address}</p>
            `}

            <p>Gracias por tu compra y esperamos que disfrutes tu pizza.</p>

            <p>Atentamente,<br>El equipo de Pipetzza</p>
        `,
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

export async function OPTIONS() {
    const response = new Response(null, { status: 200 });
    return setCorsHeaders(response); // Asegúrate de que los encabezados CORS sean correctos
}
