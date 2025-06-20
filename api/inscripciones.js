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
            // Traer datos del curso y requisitos (mock, deberías traer de la DB real)
            let curso = {};
            let sedeInfo = {};
            // Si el front envía los datos, usarlos directamente
            if (
                req.body.curso_titulo || req.body.curso_horario || req.body.curso_precio || req.body.curso_requisitos ||
                req.body.curso_modalidad || req.body.curso_promociones || req.body.curso_direccion || req.body.curso_telefono
            ) {
                curso = {
                    titulo: req.body.curso_titulo,
                    requisitos: req.body.curso_requisitos
                };
                sedeInfo = {
                    horarios: req.body.curso_horario,
                    arancel: req.body.curso_precio,
                    modalidad: req.body.curso_modalidad,
                    promociones: req.body.curso_promociones,
                    direccion: req.body.curso_direccion,
                    telefono: req.body.curso_telefono,
                    nombre: sede
                };
            } else {
                try {
                    const cursos = require('./cursos.json');
                    curso = cursos[curso_id] || {};
                    sedeInfo = curso.sedes?.find(s => s.nombre === sede) || {};
                } catch (e) {
                    console.log('[inscripciones] Error obteniendo datos de curso desde cursos.json:', e);
                }
            }
            // Insertar inscripción con datos completos
            const result = await client.query(
                `INSERT INTO inscripciones (
                    usuario_email, curso_id, sede, 
                    curso_titulo, curso_horario, curso_precio, curso_requisitos, 
                    curso_modalidad, curso_promociones, curso_direccion, curso_telefono
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
                [
                    usuario_email,
                    curso_id,
                    sede,
                    curso.titulo || '',
                    sedeInfo.horarios || '',
                    sedeInfo.arancel || '',
                    curso.requisitos || '',
                    sedeInfo.modalidad || '',
                    sedeInfo.promociones || '',
                    sedeInfo.direccion || '',
                    sedeInfo.telefono || ''
                ]
            );
            console.log('[inscripciones] Inscripción creada, id:', result.rows[0].id);
            // Enviar email real
            try {
                await transporter.sendMail({
                    from: 'Cookit <panchizanon@gmail.com>',
                    to: usuario_email,
                    subject: 'Confirmación de inscripción - ' + (curso.titulo || curso_id),
                    text: `¡Inscripción exitosa!\n\nCurso: ${curso.titulo || curso_id}\nSede: ${sedeInfo?.nombre || sede}\nDirección: ${sedeInfo?.direccion || '-'}\nTeléfono: ${sedeInfo?.telefono || '-'}\nHorario: ${sedeInfo?.horarios || '-'}\nModalidad: ${sedeInfo?.modalidad || '-'}\nArancel: ${sedeInfo?.arancel || '-'}\nPromociones: ${sedeInfo?.promociones || '-'}\nRequisitos: ${curso.requisitos || '-'}\n\nFactura: Inscripción N° ${result.rows[0].id}\n\n¡Gracias por inscribirte en Cookit!`
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
        if (req.method === 'DELETE') {
            const { usuario_email, curso_id, tipo_reintegro, porcentaje_reintegro } = req.body;
            console.log('[inscripciones] Solicitud de baja:', { usuario_email, curso_id });
            if (!usuario_email || !curso_id) {
                console.log('[inscripciones] Faltan datos para dar de baja');
                return res.status(400).json({ error: 'Faltan datos para dar de baja' });
            }
            
            // Verificar que la inscripción existe
            const existeResult = await client.query(
                'SELECT id, curso_titulo FROM inscripciones WHERE usuario_email = $1 AND curso_id = $2',
                [usuario_email, curso_id]
            );
            
            if (existeResult.rows.length === 0) {
                console.log('[inscripciones] Inscripción no encontrada');
                return res.status(404).json({ error: 'Inscripción no encontrada' });
            }
            
            const inscripcion = existeResult.rows[0];
            
            // Eliminar la inscripción
            await client.query(
                'DELETE FROM inscripciones WHERE usuario_email = $1 AND curso_id = $2',
                [usuario_email, curso_id]
            );
            
            console.log('[inscripciones] Inscripción eliminada:', inscripcion.id);
            
            // Enviar email de confirmación de baja
            try {
                const reintegroInfo = porcentaje_reintegro > 0 
                    ? `\n\nREINTEGRO:\n- Porcentaje: ${porcentaje_reintegro}%\n- Modalidad: ${tipo_reintegro === 'tarjeta' ? 'Reintegro a tarjeta' : tipo_reintegro === 'credito' ? 'Crédito en cuenta corriente' : 'Sin reintegro'}\n\nEl reintegro se procesará en los próximos 5-7 días hábiles.`
                    : '\n\nSegún las políticas de reintegro, no corresponde devolución para esta fecha de baja.';

                await transporter.sendMail({
                    from: 'Cookit <panchizanon@gmail.com>',
                    to: usuario_email,
                    subject: 'Confirmación de baja - ' + inscripcion.curso_titulo,
                    text: `Baja exitosa!\n\nTe has dado de baja del curso: ${inscripcion.curso_titulo}${reintegroInfo}\n\nLamentamos que no puedas continuar con nosotros. ¡Te esperamos en futuros cursos!\n\nSaludos,\nEquipo Cookit`
                });
                console.log('[inscripciones] Email de baja enviado a', usuario_email);
            } catch (e) {
                console.log('[inscripciones] Error enviando email de baja:', e);
            }
            
            return res.status(200).json({ success: true, message: 'Baja exitosa' });
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