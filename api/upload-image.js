const { put } = require('@vercel/blob');
const { Buffer } = require('buffer');

const BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_0v733TO2p5cRdXeH_DkS77aPSXZFz5X2pOL7tefwd7xooLS";

module.exports = async (req, res) => {
    // Permitir CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { imageData, fileName } = req.body;

        if (!imageData || !fileName) {
            return res.status(400).json({ error: 'Faltan datos de imagen o nombre de archivo' });
        }

        // Convertir base64 a buffer
        const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Generar nombre único para el archivo
        const uniqueFileName = `receta-${Date.now()}-${fileName}`;

        // Subir a Vercel Blob
        const { url } = await put(uniqueFileName, buffer, {
            access: 'public',
            token: BLOB_READ_WRITE_TOKEN,
        });

        res.status(200).json({ success: true, url });
    } catch (error) {
        console.error('Error al subir imagen:', error);
        res.status(500).json({ error: 'Error al subir la imagen', details: error.message });
    }
}; 