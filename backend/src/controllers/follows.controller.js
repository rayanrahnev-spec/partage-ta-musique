const follows = require('../repositories/follow.repository');

async function toggleFollow(req, res) {
  const result = await follows.toggleFollow({
    userId: req.user.id,
    artistId: req.params.artistId
  });

  res.json(result);
}

module.exports = { toggleFollow };
