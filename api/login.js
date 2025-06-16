const { Pool } = require('pg');
const nodemailer = require('nodemailer');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'panchizanon@gmail.com',
        pass: 'uxpe mamd qtam lont',
    },
});

function generarCodigo() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = async (req, res) => {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Método no permitido' });
        }

        const { action } = req.body;
        if (action === 'recuperar') {
            // Recuperación de contraseña: enviar código
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ error: 'Email requerido' });
            }
            // Verificar que el usuario exista
            const userResult = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
            if (userResult.rows.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            const codigo = generarCodigo();
            // Guardar código en la tabla (upsert)
            await pool.query(
                `INSERT INTO recuperacion_password (email, codigo, creado_en)
                 VALUES ($1, $2, NOW())
                 ON CONFLICT (email) DO UPDATE SET codigo = EXCLUDED.codigo, creado_en = NOW()`,
                [email, codigo]
            );
            // Enviar email
            await transporter.sendMail({
                from: 'Cookit <panchizanon@gmail.com>',
                to: email,
                subject: 'Código de recuperación de contraseña',
                text: `Tu código de recuperación es: ${codigo} (válido por 30 minutos)`
            });
            return res.status(200).json({ enviado: true });
        }
        if (action === 'cambiar') {
            // Cambiar contraseña usando código
            const { email, codigo, nuevaPassword } = req.body;
            if (!email || !codigo || !nuevaPassword) {
                return res.status(400).json({ error: 'Faltan datos requeridos' });
            }
            const result = await pool.query('SELECT codigo, creado_en FROM recuperacion_password WHERE email = $1', [email]);
            if (result.rows.length === 0) {
                return res.status(400).json({ error: 'No se encontró código para este email' });
            }
            const { codigo: codigoDB, creado_en } = result.rows[0];
            const creado = new Date(creado_en);
            const ahora = new Date();
            const minutos = (ahora - creado) / (1000 * 60);
            if (minutos > 30) {
                await pool.query('DELETE FROM recuperacion_password WHERE email = $1', [email]);
                return res.status(400).json({ error: 'El código ha expirado. Solicita uno nuevo.' });
            }
            if (codigoDB !== codigo) {
                return res.status(400).json({ error: 'Código incorrecto' });
            }
            // Cambiar la contraseña
            await pool.query('UPDATE usuarios SET password = $1 WHERE email = $2', [nuevaPassword, email]);
            await pool.query('DELETE FROM recuperacion_password WHERE email = $1', [email]);
            return res.status(200).json({ cambiado: true });
        }

        // Login normal
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