const db = require('../config/db');

async function createArtist({
  ownerUserId,
  publicName,
  bio,
  avatarUrl,
  bannerUrl
}) {
  const r = await db.query(
    `
    INSERT INTO artists
    (
      owner_user_id,
      public_name,
      bio,
      avatar_url,
      banner_url
    )
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *
    `,
    [
      ownerUserId,
      publicName,
      bio || null,
      avatarUrl || null,
      bannerUrl || null
    ]
  );

  return r.rows[0];
}

async function listArtists() {
  const r = await db.query(
    `
    SELECT
      a.*,
      COUNT(t.id)::int AS track_count
    FROM artists a
    LEFT JOIN tracks t ON t.artist_id = a.id
    GROUP BY a.id
    ORDER BY a.created_at DESC
    `,
    []
  );

  return r.rows;
}

module.exports = {
  createArtist,
  listArtists
};
