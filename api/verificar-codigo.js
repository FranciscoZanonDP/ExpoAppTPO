const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }
    const { email, codigo } = req.body;
    if (!email || !codigo) {
        return res.status(400).json({ error: 'Email y código requeridos' });
    }
    try {
        const result = await pool.query('SELECT codigo, creado_en FROM codigos_verificacion WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ valido: false, error: 'No se encontró código para este email' });
        }
        const { codigo: codigoDB, creado_en } = result.rows[0];
        const creado = new Date(creado_en);
        const ahora = new Date();
        const horas = (ahora - creado) / (1000 * 60 * 60);
        if (horas > 24) {
            await pool.query('DELETE FROM codigos_verificacion WHERE email = $1', [email]);
            return res.status(400).json({ valido: false, error: 'El código ha expirado. Solicita uno nuevo.' });
        }
        if (codigoDB === codigo) {
            // Código correcto, eliminarlo
            await pool.query('DELETE FROM codigos_verificacion WHERE email = $1', [email]);
            return res.status(200).json({ valido: true });
        } else {
            return res.status(400).json({ valido: false, error: 'Código incorrecto' });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Error verificando código', detalle: err.message });
    }
}; 