const db = require('../config/db');

async function toggleLike({ userId, trackId }) {
  const existing = await db.query(
    `SELECT id FROM track_likes WHERE user_id=$1 AND track_id=$2`,
    [userId, trackId]
  );

  if (existing.rows[0]) {
    await db.query(
      `DELETE FROM track_likes WHERE user_id=$1 AND track_id=$2`,
      [userId, trackId]
    );

    await db.query(
      `UPDATE tracks SET likes = GREATEST(likes - 1, 0) WHERE id=$1`,
      [trackId]
    );

    return { liked: false };
  }

  await db.query(
    `INSERT INTO track_likes (user_id, track_id) VALUES ($1,$2)`,
    [userId, trackId]
  );

  await db.query(
    `UPDATE tracks SET likes = likes + 1 WHERE id=$1`,
    [trackId]
  );

  return { liked: true };
}

module.exports = { toggleLike };
