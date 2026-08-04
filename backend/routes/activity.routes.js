const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');
const requireAdminKey = require('../middleware/requireAdminKey');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

router.post('/activity', authenticateToken, activityController.submitHafalanActivity);
router.post('/quiz-activity', authenticateToken, activityController.submitQuizActivity);
router.post('/listening-activity', authenticateToken, activityController.submitListeningActivity);
router.get('/activity/:student', optionalAuth, activityController.getActivityHistory);
router.get('/analytics/:student', optionalAuth, activityController.getAnalytics);
router.get('/recommendation/:student', optionalAuth, activityController.getRecommendation);
router.get('/danger-reset/:student', requireAdminKey, activityController.dangerResetStudentData);

module.exports = router;
