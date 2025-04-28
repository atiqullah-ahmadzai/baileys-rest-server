const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const multer = require('multer');
const upload = multer();


router.post('/',upload.none(), chatController.getChats);
router.post('/send',upload.single('file'), chatController.sendMessage);

module.exports = router;