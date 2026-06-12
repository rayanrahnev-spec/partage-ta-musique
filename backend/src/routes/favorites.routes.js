const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { toggleFavorite } = require("../controllers/favorites.controller");

router.post("/tracks/:trackId", requireAuth, toggleFavorite);

module.exports = router;
