const likes = require('../repositories/like.repository');

async function toggleLike(req, res) {
  const result = await likes.toggleLike({
    userId: req.user.id,
    trackId: req.params.trackId
  });

  res.json(result);
}

module.exports = { toggleLike };
