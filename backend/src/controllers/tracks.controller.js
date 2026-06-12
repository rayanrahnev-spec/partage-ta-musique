const tracks = require('../repositories/track.repository');
const users = require('../repositories/user.repository');
const { uploadAudio } = require('../services/storage.service');

async function listTracks(req, res) {
  res.json({ tracks: await tracks.listTracks() });
}

async function createTrack(req, res) {
  const audio = await uploadAudio(req.file);

  const track = await tracks.createTrack({
    artistId: req.body.artistId,
    title: req.body.title,
    genre: req.body.genre,
    description: req.body.description,
    audioUrl: audio.url,
    coverUrl: null,
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
