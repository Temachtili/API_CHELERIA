const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// configurar body-parser
app.use(bodyParser.json());

// configurar la conexión a la base de datos
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'cervezas',
    password: 'n0m3l0',
    port: 5432
});

// definir las rutas de la API
app.get('/cervezas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cerveza');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener cervezas' });
    }
});

app.get('/cervezas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM cerveza WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Cerveza no encontrada' });
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener cerveza' });
    }
});

app.post('/cervezas', async (req, res) => {
    const { nombre, precio, marca, modelo, tipo, alcohol } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO cerveza (nombre, precio, marca, modelo, tipo, alcohol) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [nombre, precio, marca, modelo, tipo, alcohol]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear cerveza' });
    }
});

app.put('/cervezas/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, marca, modelo, tipo, alcohol } = req.body;
    try {
        const result = await pool.query(
            'UPDATE cerveza SET nombre = $1, precio = $2, marca = $3, modelo = $4, tipo = $5, alcohol = $6 WHERE id = $7 RETURNING *',
            [nombre, precio, marca, modelo, tipo, alcohol, id]
        );
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Cerveza no encontrada' });
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar cerveza' });
    }
});

app.delete('/cervezas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM cerveza WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Cerveza no encontrada' });
        } else {
            res.json({ message: 'Cerveza eliminada correctamente' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar cerveza' });
    }
});

// iniciar la aplicación
app.listen(port, () => {
    console.log(`La aplicación está escuchando en el puerto ${port}`);
});
