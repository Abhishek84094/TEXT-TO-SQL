const dbService = require('../services/db.service');

exports.connectDb = async (req, res, next) => {
    try {
        const { type, host, port, user, password, database } = req.body;
        const result = await dbService.connectExternalDb(req.user.id, type, { host, port, user, password, database });
        res.json({ message: 'Connected successfully', schema: result.schema });
    } catch (error) {
        next(error);
    }
};

exports.uploadFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        const result = await dbService.processUploadedFile(req.user.id, req.file);
        res.json({ message: 'File processed successfully', schema: result.schema });
    } catch (error) {
        next(error);
    }
};

exports.getSchema = async (req, res, next) => {
    try {
        const schema = await dbService.getSchema(req.user.id);
        res.json({ schema });
    } catch (error) {
        next(error);
    }
};
