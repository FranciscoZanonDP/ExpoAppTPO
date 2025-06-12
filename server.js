const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: 'postgres://neondb_owner:npg_B1ckn3yALFsw@ep-raspy-meadow-a4w5n2yp-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

// Ruta principal
app.get('/api', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({ status: 'ok', message: 'API y base de datos conectadas correctamente.' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'No se pudo conectar a la base de datos.', error: err.message });
    }
});

// Endpoint de registro
app.post('/api/register', async (req, res) => {
    const { nombre, email, password, userType } = req.body;
    try {
        await pool.query(
            'INSERT INTO usuarios (nombre, email, password, user_type) VALUES ($1, $2, $3, $4)',
            [nombre, email, password, userType]
        );
        res.status(201).json({ message: 'Usuario registrado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint de test
app.get('/api/test', (req, res) => {
    res.status(200).json({ message: 'Test funcionando' });
});

app.listen(3000, () => console.log('API corriendo en http://localhost:3000')); 