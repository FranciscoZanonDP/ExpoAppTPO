const { codigos } = require('./enviar-codigo');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }
    const { email, codigo } = req.body;
    if (!email || !codigo) {
        return res.status(400).json({ error: 'Email y código requeridos' });
    }
    if (codigos[email] && codigos[email] === codigo) {
        // Código correcto, eliminarlo para que no se reutilice.
        delete codigos[email];
        return res.status(200).json({ valido: true });
    } else {
        return res.status(400).json({ valido: false, error: 'Código incorrecto' });
    }
}; 