const db = require('../config/db');

async function toggleFavorite({ userId, trackId }) {
  const existing = await db.query(
    `SELECT id FROM track_favorites WHERE user_id=$1 AND track_id=$2`,
    [userId, trackId]
  );

  if (existing.rows[0]) {
    await db.query(
      `DELETE FROM track_favorites WHERE user_id=$1 AND track_id=$2`,
      [userId, trackId]
    );
    return { favorited: false };
  }

  await db.query(
    `INSERT INTO track_favorites (user_id, track_id) VALUES ($1,$2)`,
    [userId, trackId]
  );

  return { favorited: true };
}

module.exports = { toggleFavorite };
