const repo = require('../repositories/artist.repository');
const { uploadAudio } = require('../services/storage.service');

async function createArtist(req, res) {
  const avatarFile = req.files?.avatar?.[0] || null;
  const bannerFile = req.files?.banner?.[0] || null;

  const avatar = avatarFile ? await uploadAudio(avatarFile) : null;
  const banner = bannerFile ? await uploadAudio(bannerFile) : null;

  const artist = await repo.createArtist({
    ownerUserId: req.user.id,
    publicName: req.body.publicName,
    bio: req.body.bio,
    avatarUrl: avatar ? avatar.url : null,
    bannerUrl: banner ? banner.url : null
  });

  res.status(201).json({ artist });
}

async function listArtists(req, res) {
  res.json({ artists: await repo.listArtists() });
}

module.exports = { createArtist, listArtists };
