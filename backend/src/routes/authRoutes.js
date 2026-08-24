const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protectOwner } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { registerValidator, loginValidator } = require('../validators/schemas');

router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);
router.post('/logout', protectOwner, authController.logout);
router.get('/me', protectOwner, authController.getMe);

module.exports = router;
