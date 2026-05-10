const express = require('express');
const router = express.Router();
const fineController = require('../controllers/fineController');

router.get('/calculate', fineController.calculateFines);

router.get('/student/:userID', fineController.getStudentFines);

router.get('/all', fineController.getAllFines);  // NEW - Get all fines for admin

router.post('/mark-paid', fineController.markFineAsPaid);  // NEW - Mark fine as paid

router.post('/pay', fineController.payFine);

module.exports = router;