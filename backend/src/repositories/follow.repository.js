const db = require('../config/db');

async function toggleFollow({ userId, artistId }) {
  const existing = await db.query(
    `SELECT id FROM artist_follows WHERE user_id=$1 AND artist_id=$2`,
    [userId, artistId]
  );

  if (existing.rows[0]) {
    await db.query(
      `DELETE FROM artist_follows WHERE user_id=$1 AND artist_id=$2`,
      [userId, artistId]
    );

    return { followed: false };
  }

  await db.query(
    `INSERT INTO artist_follows (user_id, artist_id) VALUES ($1,$2)`,
    [userId, artistId]
  );

  return { followed: true };
}

module.exports = { toggleFollow };
