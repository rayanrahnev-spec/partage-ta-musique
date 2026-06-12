const comments = require('../repositories/comment.repository');

async function listComments(req, res) {
  const data = await comments.listByTrack(req.params.trackId);
  res.json({ comments: data });
}

async function createComment(req, res) {
  const content = String(req.body.content || "").trim();

  if (!content) {
    return res.status(400).json({ error: "Commentaire vide" });
  }

  const comment = await comments.createComment({
    userId: req.user.id,
    trackId: req.params.trackId,
    content
  });

  res.status(201).json({ comment });
}

module.exports = {
  listComments,
  createComment
};
