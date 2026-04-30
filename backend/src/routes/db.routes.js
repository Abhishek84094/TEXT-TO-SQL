const express = require('express');
const router = express.Router();
const multer = require('multer');
const dbController = require('../controllers/db.controller');
const { protect } = require('../middlewares/auth.middleware');

const upload = multer({ dest: 'uploads/' });

router.post('/connect', protect, dbController.connectDb);
router.post('/upload', protect, upload.single('file'), dbController.uploadFile);
router.get('/schema', protect, dbController.getSchema);

module.exports = router;
