const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

module.exports = async (req, res) => {
    // Permitir CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const client = await pool.connect();

    try {
        if (req.method === 'GET') {
            const { receta_id, usuario_id } = req.query;

            if (!receta_id) {
                return res.status(400).json({ error: 'Falta receta_id' });
            }

            if (usuario_id) {
                // Obtener valoración específica de un usuario para una receta
                const result = await client.query(
                    'SELECT * FROM valoraciones WHERE receta_id = $1 AND usuario_id = $2',
                    [receta_id, usuario_id]
                );
                return res.status(200).json({ 
                    valoracion: result.rows[0] || null 
                });
            } else {
                // Obtener estadísticas de valoración de una receta
                const result = await client.query(`
                    SELECT 
                        COUNT(*) as total_valoraciones,
                        AVG(puntuacion) as promedio,
                        COUNT(CASE WHEN puntuacion = 1 THEN 1 END) as estrellas_1,
                        COUNT(CASE WHEN puntuacion = 2 THEN 1 END) as estrellas_2,
                        COUNT(CASE WHEN puntuacion = 3 THEN 1 END) as estrellas_3,
                        COUNT(CASE WHEN puntuacion = 4 THEN 1 END) as estrellas_4,
                        COUNT(CASE WHEN puntuacion = 5 THEN 1 END) as estrellas_5
                    FROM valoraciones 
                    WHERE receta_id = $1
                `, [receta_id]);

                const stats = result.rows[0];
                return res.status(200).json({
                    total_valoraciones: parseInt(stats.total_valoraciones),
                    promedio: stats.promedio ? parseFloat(stats.promedio).toFixed(1) : 0,
                    distribucion: {
                        1: parseInt(stats.estrellas_1),
                        2: parseInt(stats.estrellas_2),
                        3: parseInt(stats.estrellas_3),
                        4: parseInt(stats.estrellas_4),
                        5: parseInt(stats.estrellas_5)
                    }
                });
            }
        }

        if (req.method === 'POST') {
            const { receta_id, usuario_id, puntuacion } = req.body;

            if (!receta_id || !usuario_id || !puntuacion) {
                return res.status(400).json({ error: 'Faltan datos requeridos' });
            }

            if (puntuacion < 1 || puntuacion > 5) {
                return res.status(400).json({ error: 'La puntuación debe estar entre 1 y 5' });
            }

            // Insertar o actualizar valoración
            const result = await client.query(`
                INSERT INTO valoraciones (receta_id, usuario_id, puntuacion, updated_at)
                VALUES ($1, $2, $3, NOW())
                ON CONFLICT (receta_id, usuario_id)
                DO UPDATE SET puntuacion = $3, updated_at = NOW()
                RETURNING *
            `, [receta_id, usuario_id, puntuacion]);

            return res.status(200).json({ 
                success: true, 
                valoracion: result.rows[0] 
            });
        }

        if (req.method === 'DELETE') {
            const { receta_id, usuario_id } = req.body;

            if (!receta_id || !usuario_id) {
                return res.status(400).json({ error: 'Faltan datos requeridos' });
            }

            await client.query(
                'DELETE FROM valoraciones WHERE receta_id = $1 AND usuario_id = $2',
                [receta_id, usuario_id]
            );

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Método no permitido' });

    } catch (error) {
        console.error('Error en valoraciones:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        client.release();
    }
}; 