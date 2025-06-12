const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

module.exports = async (req, res) => {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Método no permitido' });
        }

        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        const result = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1',
            [email]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }
        const user = result.rows[0];
        if (user.password !== password) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }
        // Puedes devolver más datos del usuario si quieres
        return res.status(200).json({ message: 'Login exitoso', user: { id: user.id, nombre: user.nombre, email: user.email, userType: user.user_type } });
    } catch (err) {
        // Siempre responde en JSON incluso en errores inesperados
        return res.status(500).json({ error: 'Error interno del servidor', detalle: err.message });
    }
}; 