const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { toggleFollow } = require('../controllers/follows.controller');

router.post('/artists/:artistId', requireAuth, toggleFollow);

module.exports = router;
