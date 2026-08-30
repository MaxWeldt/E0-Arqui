# Entrega E0: Arquitectura de Sistemas - Energy Shark

## Consideraciones generales
* **Endpoints de la API:** La API REST (Master) está en la instancia EC2 de AWS en el puerto 3000. 
* **Base de datos:** PostgreSQL corriendo en el puerto 5432 interno de Docker.
* **Orquestación:** Se utilizó Docker Compose para levantar y conectar los tres servicios (`db`, `master`, `connector`), asegurando que todos inicien correctamente gracias a la configuración de `healthchecks`. (index.js es el master)
* **Enlaces de prueba:**
  * Historial paginado (RF1, RF3, RF4): http://18.222.132.77:3000/history
  * Detalle de evento (RF2): http://18.222.132.77:3000/history/[INSERTA_UN_ID_AQUI] 

## Nombre del dominio
Es simplemente la ipv4 de la instancia

## Método de acceso al servidor


Para acceder por SSH a la máquina EC2, debe ubicar el archivo `.pem` entregado en Canvas y ejecutar los siguientes comandos en su terminal:

1. Asignar los permisos correctos a la llave:
   ```bash
   chmod 400 parclavesec2.pem

   ssh -i "parclavesec2.pem" ubuntu@18.222.132.77

   cd E0_Arqui

   (aca pueden corregir lo que sea como por ejemplo:)
   
   sudo docker compose ps


## Puntos logrados y no logrados

Se cumplen todos los puntos excepto los siguientes:

1. Nombre del dominio con DNS.
2. HTTPS con Let's Encrypt
3. Proxy inverso.