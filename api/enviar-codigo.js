const nodemailer = require('nodemailer');

// Guardar los códigos temporalmente en memoria (idealmente usar Redis o DB)
const codigos = {};

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
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email requerido' });
    }
    const codigo = generarCodigo();
    codigos[email] = codigo;
    try {
        await transporter.sendMail({
            from: 'Cookit <panchizanon@gmail.com>',
            to: email,
            subject: 'Código de verificación Cookit',
            text: `Tu código de verificación es: ${codigo}`,
        });
        return res.status(200).json({ enviado: true });
    } catch (err) {
        return res.status(500).json({ error: 'No se pudo enviar el email', detalle: err.message });
    }
};

// Exportar codigos para otros endpoints
module.exports.codigos = codigos; 