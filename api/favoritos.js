const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

module.exports = async (req, res) => {
    const client = await pool.connect();
    try {
        if (req.method === 'POST') {
            // Agregar favorito
            const { usuario_id, receta_id } = req.body;
            if (!usuario_id || !receta_id) return res.status(400).json({ error: 'Faltan datos' });
            await client.query('INSERT INTO favoritos (usuario_id, receta_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [usuario_id, receta_id]);
            return res.status(201).json({ success: true });
        }
        if (req.method === 'DELETE') {
            // Quitar favorito
            const { usuario_id, receta_id } = req.body;
            if (!usuario_id || !receta_id) return res.status(400).json({ error: 'Faltan datos' });
            await client.query('DELETE FROM favoritos WHERE usuario_id = $1 AND receta_id = $2', [usuario_id, receta_id]);
            return res.status(200).json({ success: true });
        }
        if (req.method === 'GET') {
            // Listar favoritos de un usuario
            const { usuario_id } = req.query;
            if (!usuario_id) return res.status(400).json({ error: 'Falta usuario_id' });
            const result = await client.query(`
                SELECT f.id as favorito_id, r.*, u.nombre AS usuario_nombre
                FROM favoritos f
                JOIN recetas r ON f.receta_id = r.id
                LEFT JOIN usuarios u ON r.usuario_id = u.id
                WHERE f.usuario_id = $1
                ORDER BY f.created_at DESC
            `, [usuario_id]);
            return res.status(200).json({ favoritos: result.rows });
        }
        return res.status(405).json({ error: 'Método no permitido' });
    } catch (err) {
        res.status(500).json({ error: 'Error en favoritos', details: err.message });
    } finally {
        client.release();
    }
}; 