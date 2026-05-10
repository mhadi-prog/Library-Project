const express = require('express');
const router = express.Router();
const borrowRequestController = require('../controllers/borrowRequestController');

router.post('/request', borrowRequestController.createBorrowRequest);

router.get('/pending', borrowRequestController.getPendingRequests);

router.post('/issue', borrowRequestController.issueBorrowRequest);

router.post('/reject', borrowRequestController.rejectBorrowRequest);

// ✅ Return book - POST (not PUT)
router.post('/return', borrowRequestController.returnBook);

module.exports = router;