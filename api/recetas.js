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
            const pasosResult = await client.query('SELECT * FROM pasos WHERE receta_id = $1 ORDER BY numero ASC', [id]);
            const pasos = pasosResult.rows;
            
            // Obtener medios para cada paso
            for (let paso of pasos) {
                const mediosResult = await client.query(
                    'SELECT * FROM paso_medios WHERE paso_id = $1 ORDER BY orden ASC', 
                    [paso.id]
                );
                paso.medios = mediosResult.rows;
            }
            
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
        
        // Manejar el caso donde order puede ser un array
        let orderParam = Array.isArray(order) ? order[0] : order;
        let orderDir = (orderParam && orderParam.toLowerCase() === 'desc') ? 'DESC' : 'ASC';
        
        // Manejar el caso donde sort puede ser un array
        let sortParam = Array.isArray(sort) ? sort[0] : sort;
        if (sortParam && validSorts.includes(sortParam)) {
            if (sortParam === 'fecha') {
                orderBy = `r.created_at ${orderDir}`;
            } else if (sortParam === 'usuario') {
                orderBy = `u.nombre ${orderDir}`;
            } else if (sortParam === 'nombre') {
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
    const { nombre, categoria, descripcion, ingredientes, pasos, estado } = req.body;

    // Si solo se está actualizando el estado
    if (estado && !nombre) {
        const client = await pool.connect();
        try {
            const result = await client.query(
                'UPDATE recetas SET estado = $1 WHERE id = $2 RETURNING *',
                [estado, id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Receta no encontrada' });
            }
            return res.status(200).json({ success: true, receta: result.rows[0] });
        } catch (err) {
            console.error('Error actualizando estado:', err);
            return res.status(500).json({ error: 'Error al actualizar el estado' });
        } finally {
            client.release();
        }
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('UPDATE recetas SET nombre = $1, categoria = $2, descripcion = $3 WHERE id = $4', [nombre, categoria, descripcion, id]);
        
        // Eliminar ingredientes existentes
        await client.query('DELETE FROM ingredientes WHERE receta_id = $1', [id]);
        for (const ing of ingredientes) {
            await client.query('INSERT INTO ingredientes (receta_id, nombre, cantidad, unidad) VALUES ($1, $2, $3, $4)', [id, ing.nombre, ing.cantidad, ing.unidad]);
        }
        
        // Eliminar pasos existentes (esto también eliminará los medios por CASCADE)
        await client.query('DELETE FROM pasos WHERE receta_id = $1', [id]);
        
        // Crear nuevos pasos con sus medios
        for (const [i, paso] of pasos.entries()) {
            const pasoResult = await client.query(
                'INSERT INTO pasos (receta_id, numero, descripcion, imagen_url, video_url) VALUES ($1, $2, $3, $4, $5) RETURNING id', 
                [id, i + 1, paso.descripcion, paso.imagen_url || null, paso.video_url || null]
            );
            const pasoId = pasoResult.rows[0].id;
            
            // Insertar medios del paso si existen
            if (paso.medios && Array.isArray(paso.medios)) {
                for (const [j, medio] of paso.medios.entries()) {
                    await client.query(
                        'INSERT INTO paso_medios (paso_id, tipo, url, orden) VALUES ($1, $2, $3, $4)',
                        [pasoId, medio.tipo, medio.url, j + 1]
                    );
                }
            }
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
    
    // Obtener ID desde query params o desde el body
    const id = req.query.id || req.body.id;
    
    if (!id) {
        return res.status(400).json({ error: 'Falta el ID de la receta' });
    }
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Eliminar valoraciones de la receta
        await client.query('DELETE FROM valoraciones WHERE receta_id = $1', [id]);
        
        // Eliminar medios de los pasos (se eliminan automáticamente por CASCADE, pero por seguridad)
        await client.query(`
            DELETE FROM paso_medios 
            WHERE paso_id IN (SELECT id FROM pasos WHERE receta_id = $1)
        `, [id]);
        
        // Eliminar ingredientes
        await client.query('DELETE FROM ingredientes WHERE receta_id = $1', [id]);
        
        // Eliminar pasos
        await client.query('DELETE FROM pasos WHERE receta_id = $1', [id]);
        
        // Eliminar la receta
        const deleteResult = await client.query('DELETE FROM recetas WHERE id = $1 RETURNING id', [id]);
        
        if (deleteResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Receta no encontrada' });
        }
        
        await client.query('COMMIT');
        res.status(200).json({ success: true, message: 'Receta eliminada correctamente' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error al eliminar la receta:', err);
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
            const pasoResult = await client.query(
                `INSERT INTO pasos (receta_id, numero, descripcion, imagen_url, video_url) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                [receta_id, i + 1, paso.descripcion, paso.imagen_url || null, paso.video_url || null]
            );
            const pasoId = pasoResult.rows[0].id;
            
            // Insertar medios del paso si existen
            if (paso.medios && Array.isArray(paso.medios)) {
                for (const [j, medio] of paso.medios.entries()) {
                    await client.query(
                        'INSERT INTO paso_medios (paso_id, tipo, url, orden) VALUES ($1, $2, $3, $4)',
                        [pasoId, medio.tipo, medio.url, j + 1]
                    );
                }
            }
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

// ==================== FUNCIONES PARA PASO MEDIOS ====================

const handleGetMedios = async (req, res) => {
    const { paso_id } = req.query;
    const client = await pool.connect();
    
    try {
        if (!paso_id) {
            return res.status(400).json({ error: 'Falta paso_id' });
        }

        const result = await client.query(
            'SELECT * FROM paso_medios WHERE paso_id = $1 ORDER BY orden ASC',
            [paso_id]
        );

        return res.status(200).json({ medios: result.rows });
    } catch (error) {
        console.error('Error al obtener medios:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        client.release();
    }
};

const handlePostMedio = async (req, res) => {
    const { paso_id, tipo, url, orden } = req.body;
    const client = await pool.connect();
    
    try {
        if (!paso_id || !tipo || !url) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }

        if (!['imagen', 'video'].includes(tipo)) {
            return res.status(400).json({ error: 'Tipo debe ser imagen o video' });
        }

        const result = await client.query(
            'INSERT INTO paso_medios (paso_id, tipo, url, orden) VALUES ($1, $2, $3, $4) RETURNING *',
            [paso_id, tipo, url, orden || 1]
        );

        return res.status(201).json({ 
            success: true, 
            medio: result.rows[0] 
        });
    } catch (error) {
        console.error('Error al crear medio:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        client.release();
    }
};

const handleDeleteMedio = async (req, res) => {
    const { id } = req.query;
    const client = await pool.connect();
    
    try {
        if (!id) {
            return res.status(400).json({ error: 'Falta ID del medio' });
        }

        await client.query('DELETE FROM paso_medios WHERE id = $1', [id]);

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error al eliminar medio:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        client.release();
    }
};

const handleUpdateOrdenMedios = async (req, res) => {
    const { medios } = req.body; // Array de { id, orden }
    const client = await pool.connect();
    
    try {
        if (!medios || !Array.isArray(medios)) {
            return res.status(400).json({ error: 'Falta array de medios' });
        }

        await client.query('BEGIN');

        for (const medio of medios) {
            await client.query(
                'UPDATE paso_medios SET orden = $1 WHERE id = $2',
                [medio.orden, medio.id]
            );
        }

        await client.query('COMMIT');

        return res.status(200).json({ success: true });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al actualizar orden:', error);
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

    // Extraer ID de la URL si existe
    const urlParts = req.url.split('/');
    const recetaId = urlParts[urlParts.length - 1].split('?')[0];
    console.log('URL:', req.url, 'ID extraído:', recetaId);

    // ==================== MANEJO DE PASO-MEDIOS ====================
    // Si incluye action=paso-medios, manejar operaciones de medios
    if (req.query.action === 'paso-medios' || req.body?.action === 'paso-medios') {
        if (req.method === 'GET') {
            return handleGetMedios(req, res);
        }
        if (req.method === 'POST') {
            return handlePostMedio(req, res);
        }
        if (req.method === 'DELETE') {
            return handleDeleteMedio(req, res);
        }
        if (req.method === 'PUT') {
            return handleUpdateOrdenMedios(req, res);
        }
    }

    // ==================== MANEJO DE RECETAS Y VALORACIONES ====================
    if (req.method === 'GET') {
        return getRecetas(req, res);
    }
    if (req.method === 'PUT') {
        // Si tenemos un ID en la URL y estado en el body, actualizar estado
        if (recetaId && !isNaN(recetaId)) {
            const { estado } = req.body;
            if (estado) {
                const client = await pool.connect();
                try {
                    const result = await client.query(
                        'UPDATE recetas SET estado = $1 WHERE id = $2 RETURNING *',
                        [estado, recetaId]
                    );
                    if (result.rows.length === 0) {
                        return res.status(404).json({ error: 'Receta no encontrada' });
                    }
                    return res.status(200).json({ success: true, receta: result.rows[0] });
                } catch (err) {
                    console.error('Error actualizando estado:', err);
                    return res.status(500).json({ error: 'Error al actualizar el estado' });
                } finally {
                    client.release();
                }
            }
        }
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

// Función específica para actualizar el estado de una receta
const updateRecetaEstado = async (req, res) => {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { id } = req.query;
    const { estado } = req.body;

    if (!id || !estado) {
        return res.status(400).json({ error: 'Faltan el ID o el estado' });
    }

    const client = await pool.connect();
    try {
        const result = await client.query(
            'UPDATE recetas SET estado = $1 WHERE id = $2 RETURNING *',
            [estado, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Receta no encontrada' });
        }

        return res.status(200).json({ success: true, receta: result.rows[0] });
    } catch (err) {
        console.error('Error actualizando estado de receta:', err);
        return res.status(500).json({ error: 'Error al actualizar el estado de la receta' });
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

    // Si es una actualización de estado
    if (req.query.action === 'estado' && req.method === 'PUT') {
        return updateRecetaEstado(req, res);
    }

    // Resto del código existente...
    if (req.method === 'GET') {
        return getRecetas(req, res);
    }
    if (req.method === 'PUT') {
        return updateReceta(req, res);
    }
    if (req.method === 'DELETE') {
        if (req.body?.action === 'valoraciones') {
            return handleDeleteValoracion(req, res);
        }
        return deleteReceta(req, res);
    }
    if (req.method === 'POST') {
        if (req.body?.action === 'valoraciones') {
            return handlePostValoracion(req, res);
        }
        return handlePostReceta(req, res);
    }
    
    return res.status(405).json({ error: 'Método no permitido' });
}; 
