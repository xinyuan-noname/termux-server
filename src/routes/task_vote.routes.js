const express = require('express');
const TaskVoteController = require('../controllers/task_vote.controller');
const access = require('../middleware/access');
const router = express.Router();

router.use('/', access);

router.post('/create', TaskVoteController.createVote);
router.patch('/update', TaskVoteController.updateVote);
router.post('/submit', TaskVoteController.submitVote);

router.get('/mine', TaskVoteController.getMyVotes);
router.get('/:taskId', TaskVoteController.getVote);

module.exports = router;
