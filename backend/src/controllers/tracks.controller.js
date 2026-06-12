const tracks = require('../repositories/track.repository');
const { uploadAudio } = require('../services/storage.service');

async function listTracks(req, res) {
  res.json({ tracks: await tracks.listTracks() });
}

async function createTrack(req, res) {
  const audioFile = req.files?.audio?.[0];
  const coverFile = req.files?.cover?.[0] || null;

  const audio = await uploadAudio(audioFile);
  const cover = coverFile ? await uploadAudio(coverFile) : null;

  const track = await tracks.createTrack({
    artistId: req.body.artistId,
    title: req.body.title,
    genre: req.body.genre,
    description: req.body.description,
    audioUrl: audio.url,
    coverUrl: cover ? cover.url : null,
    rightsConfirmed: true,
    noUnauthorizedSamples: true
  });

  res.status(201).json({ track });
}

async function playTrack(req, res) {
  await tracks.incrementPlay(req.params.id);
  res.json({ message: 'Play counted' });
}

module.exports = { listTracks, createTrack, playTrack };
