const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const getValoraciones = async (req, res) => {
    const { receta_id, usuario_id } = req.query;
    const client = await pool.connect();
    
    try {
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
    } catch (error) {
        console.error('Error en valoraciones:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        client.release();
    }
};

const getRecetas = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }
    
    // Si incluye el parámetro 'action=valoraciones', manejar valoraciones
    if (req.query.action === 'valoraciones') {
        return getValoraciones(req, res);
    }
    
    const { usuario_id, usuario_email, limit, id, nombre, categoria, ingrediente_incluye, ingrediente_excluye, usuario_nombre, sort, order, estado } = req.query;
    const client = await pool.connect();
    try {
        console.log('GET /api/recetas - Query params:', req.query);
        let realUsuarioId = usuario_id;
        if (!usuario_id && usuario_email) {
            // Buscar el id del usuario por email
            const userRes = await client.query('SELECT id FROM usuarios WHERE email = $1', [usuario_email]);
            if (userRes.rows.length > 0) {
                realUsuarioId = userRes.rows[0].id;
            } else {
                // No existe el usuario
                return res.status(200).json({ recetas: [] });
            }
        }
        if (id) {
            // Obtener receta por id, incluyendo el nombre del usuario
            const recetaResult = await client.query(`
                SELECT r.*, u.nombre AS usuario_nombre
                FROM recetas r
                LEFT JOIN usuarios u ON r.usuario_id = u.id
                WHERE r.id = $1
            `, [id]);
            if (recetaResult.rows.length === 0) return res.status(404).json({ error: 'Receta no encontrada' });
            const receta = recetaResult.rows[0];
            const ingredientes = (await client.query('SELECT * FROM ingredientes WHERE receta_id = $1', [id])).rows;
            const pasos = (await client.query('SELECT * FROM pasos WHERE receta_id = $1 ORDER BY numero ASC', [id])).rows;
            return res.status(200).json({ ...receta, ingredientes, pasos });
        }
        // Listado general de recetas, incluyendo el nombre del usuario
        let query = 'SELECT DISTINCT r.*, u.nombre AS usuario_nombre FROM recetas r LEFT JOIN usuarios u ON r.usuario_id = u.id';
        let params = [];
        let where = [];
        let joinIngredientes = false;
        // Filtros
        let orFilters = [];
        if (nombre) {
            orFilters.push(`LOWER(r.nombre) LIKE $${params.length + 1}`);
            params.push(`%${nombre.toLowerCase()}%`);
        }
        if (usuario_nombre) {
            orFilters.push(`LOWER(u.nombre) LIKE $${params.length + 1}`);
            params.push(`%${usuario_nombre.toLowerCase()}%`);
        }
        if (orFilters.length > 0) {
            where.push('(' + orFilters.join(' OR ') + ')');
        }
        if (realUsuarioId) {
            where.push(`r.usuario_id = $${params.length + 1}`);
            params.push(realUsuarioId);
        }
        if (categoria) {
            where.push(`LOWER(r.categoria) LIKE $${params.length + 1}`);
            params.push(`%${categoria.toLowerCase()}%`);
        }
        if (ingrediente_incluye) {
            joinIngredientes = true;
            where.push(`r.id IN (SELECT receta_id FROM ingredientes WHERE LOWER(nombre) LIKE $${params.length + 1})`);
            params.push(`%${ingrediente_incluye.toLowerCase()}%`);
        }
        if (ingrediente_excluye) {
            joinIngredientes = true;
            where.push(`r.id NOT IN (SELECT receta_id FROM ingredientes WHERE LOWER(nombre) LIKE $${params.length + 1})`);
            params.push(`%${ingrediente_excluye.toLowerCase()}%`);
        }
        if (estado) {
            where.push(`r.estado = $${params.length + 1}`);
            params.push(estado);
        }
        if (joinIngredientes) {
            // Ya se usan subconsultas, no es necesario un JOIN explícito
        }
        if (where.length > 0) {
            query += ' WHERE ' + where.join(' AND ');
        }
        // Ordenamiento seguro
        let validSorts = ['fecha', 'usuario', 'nombre'];
        let orderBy = 'r.nombre ASC';
        let orderDir = (order && order.toLowerCase() === 'desc') ? 'DESC' : 'ASC';
        if (sort && validSorts.includes(sort)) {
            if (sort === 'fecha') {
                orderBy = `r.created_at ${orderDir}`;
            } else if (sort === 'usuario') {
                orderBy = `u.nombre ${orderDir}`;
            } else if (sort === 'nombre') {
                orderBy = `r.nombre ${orderDir}`;
            }
        }
        query += ` ORDER BY ${orderBy}`;
        if (limit) {
            query += ` LIMIT $${params.length + 1}`;
            params.push(Number(limit));
        }
        console.log('Ejecutando query de recetas...');
        const recetasResult = await client.query(query, params);
        console.log('Recetas encontradas:', recetasResult.rows.length);
        res.status(200).json({ recetas: recetasResult.rows });
    } catch (err) {
        console.error('Error en query de recetas:', err);
        res.status(500).json({ error: 'Error al obtener las recetas', details: err.message });
    } finally {
        client.release();
    }
};

const updateReceta = async (req, res) => {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Método no permitido' });
    }
    const id = req.url.split('/').pop();
    const { nombre, categoria, descripcion, ingredientes, pasos } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('UPDATE recetas SET nombre = $1, categoria = $2, descripcion = $3 WHERE id = $4', [nombre, categoria, descripcion, id]);
        await client.query('DELETE FROM ingredientes WHERE receta_id = $1', [id]);
        for (const ing of ingredientes) {
            await client.query('INSERT INTO ingredientes (receta_id, nombre, cantidad, unidad) VALUES ($1, $2, $3, $4)', [id, ing.nombre, ing.cantidad, ing.unidad]);
        }
        await client.query('DELETE FROM pasos WHERE receta_id = $1', [id]);
        for (const [i, paso] of pasos.entries()) {
            await client.query('INSERT INTO pasos (receta_id, numero, descripcion, imagen_url, video_url) VALUES ($1, $2, $3, $4, $5)', [id, i + 1, paso.descripcion, paso.imagen_url || null, paso.video_url || null]);
        }
        await client.query('COMMIT');
        res.status(200).json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'Error al actualizar la receta', details: err.message });
    } finally {
        client.release();
    }
};

const deleteReceta = async (req, res) => {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Método no permitido' });
    }
    const id = req.url.split('/').pop();
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM ingredientes WHERE receta_id = $1', [id]);
        await client.query('DELETE FROM pasos WHERE receta_id = $1', [id]);
        await client.query('DELETE FROM recetas WHERE id = $1', [id]);
        await client.query('COMMIT');
        res.status(200).json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'Error al eliminar la receta', details: err.message });
    } finally {
        client.release();
    }
};

const handlePostReceta = async (req, res) => {
    const { nombre, categoria, descripcion, usuario_id, email, imagen_url, ingredientes, pasos } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Falta el nombre de la receta' });
    if (!categoria) return res.status(400).json({ error: 'Falta la categoría' });
    if (!usuario_id) return res.status(400).json({ error: 'Falta el usuario_id' });
    if (!ingredientes || !Array.isArray(ingredientes) || ingredientes.length === 0) return res.status(400).json({ error: 'Faltan ingredientes' });
    if (!pasos || !Array.isArray(pasos) || pasos.length === 0) return res.status(400).json({ error: 'Faltan pasos' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const recetaResult = await client.query(
            `INSERT INTO recetas (nombre, categoria, descripcion, usuario_id, email, imagen_url, estado, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING id`,
            [nombre, categoria, descripcion, usuario_id, email, imagen_url, 'en_revision']
        );
        const receta_id = recetaResult.rows[0].id;
        for (const ing of ingredientes) {
            await client.query(
                `INSERT INTO ingredientes (receta_id, nombre, cantidad, unidad) VALUES ($1, $2, $3, $4)`,
                [receta_id, ing.nombre, ing.cantidad, ing.unidad]
            );
        }
        for (const [i, paso] of pasos.entries()) {
            await client.query(
                `INSERT INTO pasos (receta_id, numero, descripcion, imagen_url, video_url) VALUES ($1, $2, $3, $4, $5)`,
                [receta_id, i + 1, paso.descripcion, paso.imagen_url || null, paso.video_url || null]
            );
        }
        await client.query('COMMIT');
        res.status(201).json({ success: true, receta_id });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'Error al crear la receta', details: err.message });
    } finally {
        client.release();
    }
};

const handlePostValoracion = async (req, res) => {
    const { receta_id, usuario_id, puntuacion } = req.body;
    const client = await pool.connect();
    
    try {
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
    } catch (error) {
        console.error('Error al crear valoración:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        client.release();
    }
};

const handleDeleteValoracion = async (req, res) => {
    const { receta_id, usuario_id } = req.body;
    const client = await pool.connect();
    
    try {
        if (!receta_id || !usuario_id) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }

        await client.query(
            'DELETE FROM valoraciones WHERE receta_id = $1 AND usuario_id = $2',
            [receta_id, usuario_id]
        );

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error al eliminar valoración:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        client.release();
    }
};

module.exports = async (req, res) => {
    // Permitir CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        return getRecetas(req, res);
    }
    if (req.method === 'PUT') {
        return updateReceta(req, res);
    }
    if (req.method === 'DELETE') {
        // Si incluye action=valoraciones, manejar eliminación de valoración
        if (req.body?.action === 'valoraciones') {
            return handleDeleteValoracion(req, res);
        }
        return deleteReceta(req, res);
    }
    if (req.method === 'POST') {
        // Si incluye action=valoraciones, manejar creación/actualización de valoración
        if (req.body?.action === 'valoraciones') {
            return handlePostValoracion(req, res);
        }
        
        // Si no, procesar como creación de receta normal
        return handlePostReceta(req, res);
    }
    
    return res.status(405).json({ error: 'Método no permitido' });
}; 