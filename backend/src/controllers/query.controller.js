const llmService = require('../services/llm.service');
const dbService = require('../services/db.service');
const supabaseService = require('../services/supabase.service');

exports.executeQuery = async (req, res, next) => {
    try {
        const { question } = req.body;
        const userId = req.user.id;
        
        const schema = await dbService.getSchema(userId);
        if (!schema) {
            return res.status(400).json({ message: 'No database connected' });
        }

        // Generate SQL
        const sqlQuery = await llmService.generateSql(question, schema);
        
        // Execute SQL
        const results = await dbService.executeQuery(userId, sqlQuery);
        
        // Save to persistent history in Supabase
        try {
            await supabaseService.saveQuery(userId, question, sqlQuery, results);
        } catch (dbError) {
            console.error('Failed to save to history, but returning results anyway:', dbError);
        }

        res.json({ sqlQuery, results });
    } catch (error) {
        next(error);
    }
};

exports.getHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const history = await supabaseService.getHistory(userId);
        res.json(history);
    } catch (error) {
        next(error);
    }
};
