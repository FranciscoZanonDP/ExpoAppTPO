const pool = require('./db');

module.exports = async (req, res) => {
    const client = await pool.connect();
    try {
        if (req.method === 'POST') {
            const { usuario_email, curso_id } = req.body;
            if (!usuario_email || !curso_id) {
                return res.status(400).json({ error: 'Faltan datos' });
            }
            const result = await client.query(
                'INSERT INTO inscripciones (usuario_email, curso_id) VALUES ($1, $2) RETURNING id',
                [usuario_email, curso_id]
            );
            return res.status(201).json({ success: true, id: result.rows[0].id });
        }
        if (req.method === 'GET') {
            const { usuario_email } = req.query;
            if (!usuario_email) {
                return res.status(400).json({ error: 'Falta usuario_email' });
            }
            const result = await client.query(
                'SELECT * FROM inscripciones WHERE usuario_email = $1',
                [usuario_email]
            );
            return res.status(200).json({ inscripciones: result.rows });
        }
        return res.status(405).json({ error: 'Método no permitido' });
    } catch (err) {
        return res.status(500).json({ error: 'Error en inscripciones', details: err.message });
    } finally {
        client.release();
    }
}; 