const express = require('express');
const router = express.Router();
const queryController = require('../controllers/query.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/execute', protect, queryController.executeQuery);
router.get('/history', protect, queryController.getHistory);

module.exports = router;
