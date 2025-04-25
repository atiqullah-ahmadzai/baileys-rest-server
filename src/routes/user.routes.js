const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const multer = require('multer');
const upload = multer();

router.post('/', upload.none(), userController.getSingleUser);
router.get('/all', userController.getAllUsers);

module.exports = router;