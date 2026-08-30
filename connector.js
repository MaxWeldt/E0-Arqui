const amqp = require('amqplib');

// Configuración de credenciales y rutas
const BROKER_URL = 'amqps://observer.56:1WpXXj6r1DvCYmFBAzCsqAFv@broker.iic2173.org:5671/energy';
const QUEUE = 'observer.56.q';
const MASTER_API_URL = 'http://master:3000/api/events';

async function iniciarConnector() {
    try {
        console.log("Conectando al broker RabbitMQ...");
        const connection = await amqp.connect(BROKER_URL);
        const channel = await connection.createChannel();

        console.log(`Conexión exitosa. Escuchando en la cola: ${QUEUE}`);

        // RNF1: Resistir caídas de servicio del broker intentando reconectarse
        connection.on('error', (err) => {
            console.error("Error de conexión:", err.message);
            setTimeout(iniciarConnector, 5000); 
        });
        
        connection.on('close', () => {
            console.error("Conexión cerrada. Reintentando en 5 segundos...");
            setTimeout(iniciarConnector, 5000);
        });

        // Consumir la cola
        channel.consume(QUEUE, async (msg) => {
            if (msg !== null) {
                try {
                    // 1. Parsear el string a un objeto JSON
                    const evento = JSON.parse(msg.content.toString());
                    
                    // 2. Agregar el timestamp exigido por el enunciado
                    evento.receivedAt = new Date().toISOString();

                    // 3. Alimentar al servicio principal mediante una llamada HTTP POST
                    const response = await fetch(MASTER_API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(evento)
                    });

                    if (response.ok) {
                        // 4. Confirmar al broker que el mensaje fue procesado correctamente
                        channel.ack(msg);
                        console.log(`Evento ${evento.idpk} guardado con éxito.`);
                    } else {
                        throw new Error(`Master respondió con un error HTTP: ${response.status}`);
                    }
                } catch (error) {
                    console.error("Error procesando o enviando el mensaje:", error.message);
                    // Si falla el parseo o el servidor Master está caído, devolvemos el mensaje a la cola
                    channel.nack(msg); 
                }
            }
        });

    } catch (error) {
        console.error("Fallo al iniciar el connector. Reintentando en 5 segundos...", error.message);
        setTimeout(iniciarConnector, 5000);
    }
}

iniciarConnector();