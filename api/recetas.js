const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const getRecetas = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
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

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        return getRecetas(req, res);
    }
    if (req.method === 'PUT') {
        return updateReceta(req, res);
    }
    if (req.method === 'DELETE') {
        return deleteReceta(req, res);
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }
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