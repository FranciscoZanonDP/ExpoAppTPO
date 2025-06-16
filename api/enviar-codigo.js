const nodemailer = require('nodemailer');
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

console.log('[enviar-codigo] Inicializando transporter...');
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
    console.log('[enviar-codigo] Nueva solicitud:', req.method, req.body);
    if (req.method !== 'POST') {
        console.log('[enviar-codigo] Método no permitido:', req.method);
        return res.status(405).json({ error: 'Método no permitido' });
    }
    const { email } = req.body;
    if (!email) {
        console.log('[enviar-codigo] Email requerido no recibido');
        return res.status(400).json({ error: 'Email requerido' });
    }
    const codigo = generarCodigo();
    try {
        // Guardar el código en la base de datos (upsert)
        await pool.query(
            `INSERT INTO codigos_verificacion (email, codigo, creado_en)
             VALUES ($1, $2, NOW())
             ON CONFLICT (email) DO UPDATE SET codigo = EXCLUDED.codigo, creado_en = NOW()`,
            [email, codigo]
        );
        console.log(`[enviar-codigo] Código guardado en DB para ${email}: ${codigo}`);
        console.log('[enviar-codigo] Enviando email...');
        await transporter.sendMail({
            from: 'Cookit <panchizanon@gmail.com>',
            to: email,
            subject: 'Código de verificación Cookit',
            text: `Tu código de verificación es: ${codigo}`,
        });
        console.log('[enviar-codigo] Email enviado correctamente a', email);
        return res.status(200).json({ enviado: true });
    } catch (err) {
        console.log('[enviar-codigo] Error enviando email o guardando código:', err);
        return res.status(500).json({ error: 'No se pudo enviar el email', detalle: err.message });
    }
};

// Exportar codigos para otros endpoints
module.exports.codigos = codigos; 