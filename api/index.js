module.exports = async (req, res) => {
    if (req.url === '/test' && req.method === 'GET') {
        return res.status(200).json({
            status: 'test_ok',
            message: 'Ruta de prueba funcionando correctamente'
        });
    }
    if ((req.url === '/' || req.url === '') && req.method === 'GET') {
        return res.status(200).json({
            status: 'ok',
            message: 'API funcionando V1.1'
        });
    }
    res.status(404).json({ error: 'Not found' });
};