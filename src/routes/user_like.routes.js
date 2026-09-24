const express = require('express');
const UserLikeController = require('../controllers/user_like.controller');
const access = require('../middleware/access');
const createRateLimiter = require('../middleware/rateLimit');
const router = express.Router();

router.use('/', access);

router.post('/', createRateLimiter(1, 40), UserLikeController.likeUser);
router.post('/cancel', createRateLimiter(1, 40), UserLikeController.cancelLike);

router.get('/my', UserLikeController.getMyLikeSummary);
router.get('/user/:id', UserLikeController.getLikeInfo);

module.exports = router;
