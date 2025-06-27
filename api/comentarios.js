const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

module.exports = async (req, res) => {
    const client = await pool.connect();
    try {
        if (req.method === 'POST') {
            // Agregar comentario
            const { receta_id, usuario_id, texto } = req.body;
            if (!receta_id || !usuario_id || !texto) return res.status(400).json({ error: 'Faltan datos' });
            await client.query(
                'INSERT INTO comentarios (receta_id, usuario_id, texto, estado) VALUES ($1, $2, $3, $4)',
                [receta_id, usuario_id, texto, 'en_revision']
            );
            return res.status(201).json({ success: true });
        }
        if (req.method === 'GET') {
            // Listar comentarios de una receta
            const { receta_id, usuario_id } = req.query;
            if (!receta_id) return res.status(400).json({ error: 'Falta receta_id' });
            
            let query, params;
            if (usuario_id) {
                // Si se proporciona usuario_id, mostrar comentarios aprobados + los propios en revisión
                query = `
                    SELECT c.*, u.nombre AS usuario_nombre
                    FROM comentarios c
                    LEFT JOIN usuarios u ON c.usuario_id = u.id
                    WHERE c.receta_id = $1 
                    AND (c.estado = 'aprobado' OR (c.usuario_id = $2 AND c.estado = 'en_revision'))
                    ORDER BY c.created_at ASC
                `;
                params = [receta_id, usuario_id];
            } else {
                // Si no se proporciona usuario_id, solo mostrar comentarios aprobados
                query = `
                    SELECT c.*, u.nombre AS usuario_nombre
                    FROM comentarios c
                    LEFT JOIN usuarios u ON c.usuario_id = u.id
                    WHERE c.receta_id = $1 AND c.estado = 'aprobado'
                    ORDER BY c.created_at ASC
                `;
                params = [receta_id];
            }
            
            const result = await client.query(query, params);
            return res.status(200).json({ comentarios: result.rows });
        }
        return res.status(405).json({ error: 'Método no permitido' });
    } catch (err) {
        res.status(500).json({ error: 'Error en comentarios', details: err.message });
    } finally {
        client.release();
    }
}; 