const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/recommendations/:userID', analyticsController.getRecommendations);
router.get('/most-borrowed', analyticsController.getMostBorrowedBooks);
router.get('/monthly-trend', analyticsController.getMonthlyTrend);
router.get('/genre-distribution', analyticsController.getGenreDistribution);
router.get('/overview-stats', analyticsController.getOverviewStats);
router.get('/reading-streak/:userID', analyticsController.getReadingStreak);
router.get('/demand-forecast', analyticsController.getDemandForecast);
module.exports = router;