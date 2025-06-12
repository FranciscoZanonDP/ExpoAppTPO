const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

module.exports = async (req, res) => {
    try {
        if (req.method === 'GET') {
            // Nuevo endpoint para traer todos los usuarios
            try {
                console.log('Obteniendo todos los usuarios...');
                const result = await pool.query('SELECT * FROM usuarios');
                console.log('Usuarios obtenidos:', result.rows);
                return res.status(200).json({ usuarios: result.rows });
            } catch (err) {
                console.error('Error al obtener usuarios:', err.message);
                return res.status(500).json({ error: err.message });
            }
        }
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Método no permitido' });
        }

        const { nombre, email, password, userType } = req.body;
        console.log('Datos recibidos para registro:', nombre, email, password, userType);

        try {
            const insertResult = await pool.query(
                'INSERT INTO usuarios (nombre, email, password, user_type) VALUES ($1, $2, $3, $4) RETURNING *',
                [nombre, email, password, userType]
            );
            console.log('Usuario insertado:', insertResult.rows[0]);
            return res.status(201).json({ message: 'Usuario registrado', usuario: insertResult.rows[0] });
        } catch (err) {
            console.error('Error al registrar usuario:', err.message);
            return res.status(500).json({ error: err.message });
        }
    } catch (err) {
        // Siempre responde en JSON incluso en errores inesperados
        return res.status(500).json({ error: 'Error interno del servidor', detalle: err.message });
    }
}; 