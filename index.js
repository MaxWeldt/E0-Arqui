const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('@koa/router');
const { Pool } = require('pg');

const app = new Koa();
const router = new Router();


const pool = new Pool({
  user: 'maxweldt',
  host: 'db',
  database: 'energy_shark',
  password: 'maxweldt2004',
  port: 5432,
});

app.use(bodyParser());

router.post('/api/events', async (ctx) => {
    const eventoRecibido = ctx.request.body;
    
    const { idpk, type, packageBody, receivedAt } = eventoRecibido;

    const query = `
        INSERT INTO energy_events (idpk, type, received_at, package_body)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (idpk) DO NOTHING
        RETURNING *;
    `;
    const values = [idpk, type, receivedAt, packageBody];

    try {
        await pool.query(query, values);
        console.log(`Evento insertado en DB: ${idpk}`);
        
        ctx.status = 201;
        ctx.body = { message: 'Evento procesado y guardado correctamente' };
    } catch (error) {
        console.error('Error insertando en la base de datos:', error.message);
        ctx.status = 500;
        ctx.body = { error: 'Error interno del servidor' };
    }
});



router.get('/history', async (ctx) => {
    const page = parseInt(ctx.query.page) || 1;
    const limit = parseInt(ctx.query.limit) || 25;
    const offset = (page - 1) * limit;
    
    const receivedAt = ctx.query.receivedAt; 

    let query = 'SELECT * FROM energy_events';
    let values = [];

    if (receivedAt) {
        query += ' WHERE DATE(received_at) = $1';
        values.push(receivedAt);
    }
    query += ` ORDER BY received_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    try {
        const { rows } = await pool.query(query, values);
        ctx.body = { 
            data: rows, 
            page: page, 
            limit: limit 
        };
    } catch (error) {
        console.error('Error consultando /history:', error.message);
        ctx.status = 500;
        ctx.body = { error: 'Error consultando el historial' };
    }
});

router.get('/history/:id', async (ctx) => {
    const { id } = ctx.params;
    try {
        const { rows } = await pool.query('SELECT * FROM energy_events WHERE idpk = $1', [id]);
        
        if (rows.length === 0) {
            ctx.status = 404;
            ctx.body = { error: 'Evento no encontrado' };
            return;
        }
        
        ctx.body = rows[0];
    } catch (error) {
        console.error('Error consultando /history/:id:', error.message);
        ctx.status = 500;
        ctx.body = { error: 'Error consultando la base de datos' };
    }
});


app.use(router.routes());
app.use(router.allowedMethods());

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor Master corriendo en el puerto ${PORT}`);
});