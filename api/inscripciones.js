const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
const nodemailer = require('nodemailer');

const MAX_VACANTES = 30; // Puedes ajustar este valor

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'panchizanon@gmail.com',
        pass: 'uxpe mamd qtam lont',
    },
});

module.exports = async (req, res) => {
    const client = await pool.connect();
    try {
        if (req.method === 'POST') {
            const { usuario_email, curso_id, sede } = req.body;
            if (!usuario_email || !curso_id || !sede) {
                return res.status(400).json({ error: 'Faltan datos' });
            }
            // Verificar vacantes
            const vacantesResult = await client.query(
                'SELECT COUNT(*) FROM inscripciones WHERE curso_id = $1 AND sede = $2',
                [curso_id, sede]
            );
            const inscriptos = parseInt(vacantesResult.rows[0].count, 10);
            if (inscriptos >= MAX_VACANTES) {
                return res.status(409).json({ error: 'No hay vacantes disponibles en esta sede.' });
            }
            // Insertar inscripción
            const result = await client.query(
                'INSERT INTO inscripciones (usuario_email, curso_id, sede) VALUES ($1, $2, $3) RETURNING id',
                [usuario_email, curso_id, sede]
            );
            // Traer datos del curso y requisitos (mock, deberías traer de la DB real)
            const cursos = require('../app/views/curso-detalle.tsx').cursos || {};
            const curso = cursos[curso_id] || {};
            // Enviar email real
            await transporter.sendMail({
                from: 'Cookit <panchizanon@gmail.com>',
                to: usuario_email,
                subject: 'Confirmación de inscripción - ' + (curso.titulo || 'Curso'),
                text: `¡Inscripción exitosa!

Curso: ${curso.titulo || curso_id}
Sede: ${sede}
Horario: ${curso.horario || '-'}
Precio: ${curso.precio || '-'}
Requisitos: ${curso.requisitos || '-'}

Factura: Inscripción N° ${result.rows[0].id}

¡Gracias por inscribirte en Cookit!`
            });
            return res.status(201).json({ success: true, id: result.rows[0].id });
        }
        if (req.method === 'GET') {
            const { usuario_email } = req.query;
            if (!usuario_email) {
                return res.status(400).json({ error: 'Falta usuario_email' });
            }
            const result = await client.query(
                'SELECT * FROM inscripciones WHERE usuario_email = $1',
                [usuario_email]
            );
            return res.status(200).json({ inscripciones: result.rows });
        }
        return res.status(405).json({ error: 'Método no permitido' });
    } catch (err) {
        return res.status(500).json({ error: 'Error en inscripciones', details: err.message });
    } finally {
        client.release();
    }
}; 