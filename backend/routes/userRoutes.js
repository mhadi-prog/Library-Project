const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const bookController = require('../controllers/booksController'); // ✅ ADD THIS

router.get('/search/students', userController.searchStudents);
router.get('/history', userController.getBorrowHistory);
router.get('/history/:userID', userController.getStudentHistory);

router.post('/change-password', userController.changePassword);

router.put('/:bookID', bookController.updateBook);

// KEEP THIS LAST
router.get('/:userID', userController.getUserDetails);

module.exports = router;