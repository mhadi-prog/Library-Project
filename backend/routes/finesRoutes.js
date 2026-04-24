const express = require('express');
const router = express.Router();
const fineController = require('../controllers/fineController');

router.get('/calculate', fineController.calculateFines);
router.get('/student/:userID', fineController.getStudentFines);
router.post('/pay', fineController.payFine);

module.exports = router;