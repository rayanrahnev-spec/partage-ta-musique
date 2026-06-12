const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { listComments, createComment } = require('../controllers/comments.controller');

router.get('/tracks/:trackId', listComments);
router.post('/tracks/:trackId', requireAuth, createComment);

module.exports = router;
