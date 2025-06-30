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
            const { receta_id, usuario_id, estado } = req.query;
            
            // Si se solicitan comentarios en revisión (para el panel de admin)
            if (estado === 'en_revision') {
                const query = `
                    SELECT c.*, u.nombre AS usuario_nombre, r.nombre AS receta_nombre
                    FROM comentarios c
                    LEFT JOIN usuarios u ON c.usuario_id = u.id
                    LEFT JOIN recetas r ON c.receta_id = r.id
                    WHERE c.estado = 'en_revision'
                    ORDER BY c.created_at ASC
                `;
                const result = await client.query(query);
                return res.status(200).json({ comentarios: result.rows });
            }
            
            // Listar comentarios de una receta específica
            if (!receta_id) return res.status(400).json({ error: 'Falta receta_id' });
            
            let query, params;
            if (usuario_id) {
                // Si se proporciona usuario_id, mostrar comentarios aprobados + los propios en revisión
                query = `
                    SELECT c.*, u.nombre AS usuario_nombre
                    FROM comentarios c
                    LEFT JOIN usuarios u ON c.usuario_id = u.id
                    WHERE c.receta_id = $1 
                    AND (c.estado = 'aprobada' OR (c.usuario_id = $2 AND c.estado = 'en_revision'))
                    ORDER BY c.created_at ASC
                `;
                params = [receta_id, usuario_id];
            } else {
                // Si no se proporciona usuario_id, solo mostrar comentarios aprobados
                query = `
                    SELECT c.*, u.nombre AS usuario_nombre
                    FROM comentarios c
                    LEFT JOIN usuarios u ON c.usuario_id = u.id
                    WHERE c.receta_id = $1 AND c.estado = 'aprobada'
                    ORDER BY c.created_at ASC
                `;
                params = [receta_id];
            }
            
            const result = await client.query(query, params);
            return res.status(200).json({ comentarios: result.rows });
        }
        
        if (req.method === 'PUT') {
            const comentarioId = req.url.split('/').pop();
            const { estado } = req.body;
            
            if (!comentarioId || !estado) {
                return res.status(400).json({ error: 'Faltan datos requeridos' });
            }
            
            const query = 'UPDATE comentarios SET estado = $1 WHERE id = $2 RETURNING *';
            const result = await client.query(query, [estado, comentarioId]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Comentario no encontrado' });
            }
            
            return res.status(200).json({ success: true, comentario: result.rows[0] });
        }
        return res.status(405).json({ error: 'Método no permitido' });
    } catch (err) {
        res.status(500).json({ error: 'Error en comentarios', details: err.message });
    } finally {
        client.release();
    }
}; 