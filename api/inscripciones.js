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

// Función para calcular estado del curso según fechas
function calcularEstadoCurso(inscripcion) {
    if (inscripcion.estado === 'dado_de_baja') return 'dado_de_baja';
    
    // Extraer fechas del campo curso_horario o descripción
    const fechaInicioMatch = inscripcion.curso_titulo?.match(/inicio:\s*(\d{2}-\d{2}-\d{2})/);
    const fechaFinMatch = inscripcion.curso_titulo?.match(/finalización:\s*(\d{2}-\d{2}-\d{2})/);
    
    if (!fechaInicioMatch) return inscripcion.estado || 'por_empezar';
    
    const [dayI, monthI, yearI] = fechaInicioMatch[1].split('-');
    const fechaInicio = new Date(2000 + parseInt(yearI), parseInt(monthI) - 1, parseInt(dayI));
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaFinMatch) {
        const [dayF, monthF, yearF] = fechaFinMatch[1].split('-');
        const fechaFin = new Date(2000 + parseInt(yearF), parseInt(monthF) - 1, parseInt(dayF));
        
        if (hoy > fechaFin) return 'finalizado';
        if (hoy >= fechaInicio) return 'activo';
    } else {
        if (hoy >= fechaInicio) return 'activo';
    }
    
    return 'por_empezar';
}

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
                    curso_modalidad, curso_promociones, curso_direccion, curso_telefono, estado
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
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
                    sedeInfo.telefono || '',
                    'por_empezar' // Estado inicial
                ]
            );

            // Registrar el pago
            const inscripcionId = result.rows[0].id;
            const monto = parseFloat((sedeInfo.arancel || '0').replace(/[$.,]/g, '')) || 0;
            
            await client.query(
                `INSERT INTO pagos (usuario_email, inscripcion_id, monto, metodo_pago, numero_tarjeta_ultimos4) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [usuario_email, inscripcionId, monto, 'tarjeta', '****']
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
            const { usuario_email, tipo } = req.query;
            if (!usuario_email) {
                console.log('[inscripciones] Falta usuario_email en GET');
                return res.status(400).json({ error: 'Falta usuario_email' });
            }

            // Si se solicita historial de pagos
            if (tipo === 'pagos') {
                const result = await client.query(
                    `SELECT p.*, i.curso_titulo, i.sede 
                     FROM pagos p 
                     JOIN inscripciones i ON p.inscripcion_id = i.id 
                     WHERE p.usuario_email = $1 
                     ORDER BY p.fecha_pago DESC`,
                    [usuario_email]
                );
                return res.status(200).json({ pagos: result.rows });
            }

            // Si se solicita cuenta corriente
            if (tipo === 'cuenta_corriente') {
                const result = await client.query(
                    `SELECT cc.*, i.curso_titulo 
                     FROM cuenta_corriente cc 
                     LEFT JOIN inscripciones i ON cc.inscripcion_id = i.id 
                     WHERE cc.usuario_email = $1 
                     ORDER BY cc.fecha DESC`,
                    [usuario_email]
                );
                
                // Calcular saldo
                const saldoResult = await client.query(
                    `SELECT 
                        COALESCE(SUM(CASE WHEN tipo = 'credito' THEN monto ELSE 0 END) - 
                                SUM(CASE WHEN tipo = 'debito' THEN monto ELSE 0 END), 0) as saldo
                     FROM cuenta_corriente WHERE usuario_email = $1`,
                    [usuario_email]
                );
                
                return res.status(200).json({ 
                    movimientos: result.rows,
                    saldo: saldoResult.rows[0].saldo 
                });
            }

            // Inscripciones normales con cálculo de estado
            const result = await client.query(
                'SELECT * FROM inscripciones WHERE usuario_email = $1',
                [usuario_email]
            );
            
            // Actualizar estados según fechas
            const inscripcionesConEstado = result.rows.map(inscripcion => {
                const estadoCalculado = calcularEstadoCurso(inscripcion);
                return { ...inscripcion, estado_calculado: estadoCalculado };
            });
            
            console.log('[inscripciones] Inscripciones encontradas:', result.rows.length);
            return res.status(200).json({ inscripciones: inscripcionesConEstado });
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
            
            // Marcar como dado de baja en lugar de eliminar (para historial)
            await client.query(
                'UPDATE inscripciones SET estado = $1 WHERE usuario_email = $2 AND curso_id = $3',
                ['dado_de_baja', usuario_email, curso_id]
            );

            // Si hay reintegro, agregar crédito a cuenta corriente
            if (porcentaje_reintegro > 0 && tipo_reintegro === 'credito') {
                const pagoOriginal = await client.query(
                    'SELECT monto FROM pagos WHERE inscripcion_id = $1',
                    [inscripcion.id]
                );
                
                const montoReintegro = pagoOriginal.rows.length > 0 
                    ? (pagoOriginal.rows[0].monto * porcentaje_reintegro / 100)
                    : 0;

                if (montoReintegro > 0) {
                    await client.query(
                        `INSERT INTO cuenta_corriente (usuario_email, tipo, monto, concepto, inscripcion_id) 
                         VALUES ($1, $2, $3, $4, $5)`,
                        [usuario_email, 'credito', montoReintegro, 
                         `Reintegro ${porcentaje_reintegro}% - ${inscripcion.curso_titulo}`, 
                         inscripcion.id]
                    );
                }
            }
            
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