const router = require('express').Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { requireAuth } = require('../middleware/auth');
const { createArtist, listArtists } = require('../controllers/artists.controller');

router.get('/', listArtists);

router.post(
  '/',
  requireAuth,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
  ]),
  createArtist
);

module.exports = router;
