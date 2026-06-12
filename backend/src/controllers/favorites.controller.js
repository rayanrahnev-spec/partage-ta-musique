const favorites = require('../repositories/favorite.repository');

async function toggleFavorite(req, res) {
  const result = await favorites.toggleFavorite({
    userId: req.user.id,
    trackId: req.params.trackId
  });

  res.json(result);
}

module.exports = { toggleFavorite };
