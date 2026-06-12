const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { toggleLike } = require('../controllers/likes.controller');

router.post('/tracks/:trackId', requireAuth, toggleLike);

module.exports = router;
