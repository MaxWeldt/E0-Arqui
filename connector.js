const amqp = require('amqplib');

const BROKER_URL = 'amqps://observer.56:1WpXXj6r1DvCYmFBAzCsqAFv@broker.iic2173.org:5671/energy';
const QUEUE = 'observer.56.q';
const MASTER_API_URL = 'http://master:3000/api/events';

async function iniciarConnector() {
    try {
        console.log("Conectando al broker RabbitMQ...");
        const connection = await amqp.connect(BROKER_URL);
        const channel = await connection.createChannel();

        console.log(`Conexión exitosa. Escuchando en la cola: ${QUEUE}`);

        connection.on('error', (err) => {
            console.error("Error de conexión:", err.message);
            setTimeout(iniciarConnector, 5000); 
        });
        
        connection.on('close', () => {
            console.error("Conexión cerrada. Reintentando en 5 segundos...");
            setTimeout(iniciarConnector, 5000);
        });

        channel.consume(QUEUE, async (msg) => {
            if (msg !== null) {
                try {
                    const evento = JSON.parse(msg.content.toString());
                    
                    evento.receivedAt = new Date().toISOString();

                    const response = await fetch(MASTER_API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(evento)
                    });

                    if (response.ok) {
                        channel.ack(msg);
                        console.log(`Evento ${evento.idpk} guardado con éxito.`);
                    } else {
                        throw new Error(`Master respondió con un error HTTP: ${response.status}`);
                    }
                } catch (error) {
                    console.error("Error procesando o enviando el mensaje:", error.message);
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