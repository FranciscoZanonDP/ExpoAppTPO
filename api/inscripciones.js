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
        console.log('[inscripciones] Nueva solicitud:', req.method, req.body);
        if (req.method === 'POST') {
            const { usuario_email, curso_id, sede } = req.body;
            console.log('[inscripciones] Datos recibidos:', { usuario_email, curso_id, sede });
            if (!usuario_email || !curso_id || !sede) {
                console.log('[inscripciones] Faltan datos');
                return res.status(400).json({ error: 'Faltan datos' });
            }
            // Verificar vacantes
            const vacantesResult = await client.query(
                'SELECT COUNT(*) FROM inscripciones WHERE curso_id = $1 AND sede = $2',
                [curso_id, sede]
            );
            const inscriptos = parseInt(vacantesResult.rows[0].count, 10);
            console.log(`[inscripciones] Inscriptos en curso ${curso_id}, sede ${sede}:`, inscriptos);
            if (inscriptos >= MAX_VACANTES) {
                console.log('[inscripciones] No hay vacantes disponibles');
                return res.status(409).json({ error: 'No hay vacantes disponibles en esta sede.' });
            }
            // Insertar inscripción
            const result = await client.query(
                'INSERT INTO inscripciones (usuario_email, curso_id, sede) VALUES ($1, $2, $3) RETURNING id',
                [usuario_email, curso_id, sede]
            );
            console.log('[inscripciones] Inscripción creada, id:', result.rows[0].id);
            // Traer datos del curso y requisitos (mock, deberías traer de la DB real)
            let curso = {};
            try {
                const cursos = require('../app/views/curso-detalle.tsx').cursos || {};
                curso = cursos[curso_id] || {};
            } catch (e) {
                console.log('[inscripciones] Error obteniendo datos mock de curso:', e);
            }
            // Enviar email real
            try {
                await transporter.sendMail({
                    from: 'Cookit <panchizanon@gmail.com>',
                    to: usuario_email,
                    subject: 'Confirmación de inscripción - ' + (curso.titulo || 'Curso'),
                    text: `¡Inscripción exitosa!\n\nCurso: ${curso.titulo || curso_id}\nSede: ${sede}\nHorario: ${curso.horario || '-'}\nPrecio: ${curso.precio || '-'}\nRequisitos: ${curso.requisitos || '-'}\n\nFactura: Inscripción N° ${result.rows[0].id}\n\n¡Gracias por inscribirte en Cookit!`
                });
                console.log('[inscripciones] Email enviado a', usuario_email);
            } catch (e) {
                console.log('[inscripciones] Error enviando email:', e);
            }
            return res.status(201).json({ success: true, id: result.rows[0].id });
        }
        if (req.method === 'GET') {
            const { usuario_email } = req.query;
            if (!usuario_email) {
                console.log('[inscripciones] Falta usuario_email en GET');
                return res.status(400).json({ error: 'Falta usuario_email' });
            }
            const result = await client.query(
                'SELECT * FROM inscripciones WHERE usuario_email = $1',
                [usuario_email]
            );
            console.log('[inscripciones] Inscripciones encontradas:', result.rows.length);
            return res.status(200).json({ inscripciones: result.rows });
        }
        console.log('[inscripciones] Método no permitido:', req.method);
        return res.status(405).json({ error: 'Método no permitido' });
    } catch (err) {
        console.log('[inscripciones] Error general:', err);
        return res.status(500).json({ error: 'Error en inscripciones', details: err.message });
    } finally {
        client.release();
    }
}; 