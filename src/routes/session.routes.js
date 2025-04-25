const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');

router.get('/start', sessionController.startConnection);
router.get('/status', sessionController.getStatus);
router.get('/restart', sessionController.restartConnection);
router.get('/qr', sessionController.getQrCode);

module.exports = router;
