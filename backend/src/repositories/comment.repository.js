const db = require('../config/db');

async function listByTrack(trackId) {
  const r = await db.query(
    `
    SELECT
      c.*,
      u.public_name AS user_name
    FROM comments c
    JOIN users u ON u.id = c.user_id
    WHERE c.track_id = $1
    ORDER BY c.created_at DESC
    `,
    [trackId]
  );

  return r.rows;
}

async function createComment({ userId, trackId, content }) {
  const r = await db.query(
    `
    INSERT INTO comments (user_id, track_id, content)
    VALUES ($1,$2,$3)
    RETURNING *
    `,
    [userId, trackId, content]
  );

  return r.rows[0];
}

module.exports = {
  listByTrack,
  createComment
};
