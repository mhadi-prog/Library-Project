const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/:userID', userController.getUserDetails);
router.get('/search/students', userController.searchStudents);
router.get('/history/:userID', userController.getStudentHistory);
router.post('/change-password', userController.changePassword);

module.exports = router;