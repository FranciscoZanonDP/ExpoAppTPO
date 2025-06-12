const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email requerido' });
    }
    try {
        await pool.query(
            'UPDATE usuarios SET user_type = $1 WHERE email = $2',
            ['Alumno', email]
        );
        res.status(200).json({ message: 'Tipo de usuario actualizado a Alumno' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}; 