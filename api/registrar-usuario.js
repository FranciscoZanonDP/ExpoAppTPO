const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }
    const { nombre, email, password, userType, medioPago, fotoDniFrente, fotoDniDorso, numeroTramiteDni } = req.body;
    if (!nombre || !email || !password || !userType) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    try {
        // Insertar usuario y obtener id
        const result = await pool.query(
            'INSERT INTO usuarios (nombre, email, password, user_type) VALUES ($1, $2, $3, $4) RETURNING id',
            [nombre, email, password, userType]
        );
        const usuarioId = result.rows[0].id;
        if (userType === 'Alumno') {
            await pool.query(
                `INSERT INTO alumnos_info (usuario_id, medio_pago, foto_dni_frente, foto_dni_dorso, numero_tramite_dni)
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    usuarioId,
                    medioPago || null,
                    fotoDniFrente || null,
                    fotoDniDorso || null,
                    numeroTramiteDni || null
                ]
            );
        }
        return res.status(201).json({ registrado: true });
    } catch (err) {
        return res.status(500).json({ error: 'No se pudo registrar', detalle: err.message });
    }
}; 