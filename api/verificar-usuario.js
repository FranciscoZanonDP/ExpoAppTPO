const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

function generarAliasAlternativos(alias) {
    // Genera 3 sugerencias simples agregando números
    return [1,2,3].map(n => alias + n);
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }
    const { email, alias } = req.body;
    if (!email || !alias) {
        return res.status(400).json({ error: 'Email y alias requeridos' });
    }
    try {
        const emailResult = await pool.query('SELECT 1 FROM usuarios WHERE email = $1', [email]);
        const aliasResult = await pool.query('SELECT 1 FROM usuarios WHERE nombre = $1', [alias]);
        const emailOcupado = emailResult.rows.length > 0;
        const aliasOcupado = aliasResult.rows.length > 0;
        let sugerencias = [];
        if (aliasOcupado) {
            sugerencias = generarAliasAlternativos(alias);
        }
        return res.status(200).json({ emailOcupado, aliasOcupado, sugerencias });
    } catch (err) {
        return res.status(500).json({ error: 'Error interno', detalle: err.message });
    }
}; 