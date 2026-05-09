const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');

// This remains POST because you are creating a new record
router.post('/issue', borrowController.issueBook);

// CHANGE THIS TO .put TO MATCH YOUR FRONTEND axios.put CALL
router.put('/return', borrowController.returnBook);

// This remains GET for fetching data
router.get('/student/:userID', borrowController.getStudentBooks);

module.exports = router;