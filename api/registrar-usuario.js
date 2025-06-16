const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }
    const { nombre, email, password, userType } = req.body;
    if (!nombre || !email || !password || !userType) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    try {
        // Insertar usuario
        await pool.query(
            'INSERT INTO usuarios (nombre, email, password, user_type) VALUES ($1, $2, $3, $4)',
            [nombre, email, password, userType]
        );
        return res.status(201).json({ registrado: true });
    } catch (err) {
        return res.status(500).json({ error: 'No se pudo registrar', detalle: err.message });
    }
}; 