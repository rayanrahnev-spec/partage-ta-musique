const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.APP_URL || "*" }));
app.use(express.json({ limit: "2mb" }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

app.get("/", (req, res) => res.json({ app: "Partage ta musique API", version: "1.0.0", status: "ready" }));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/artists", require("./routes/artists.routes"));
app.use("/api/tracks", require("./routes/tracks.routes"));
app.use("/api/subscriptions", require("./routes/subscriptions.routes"));
app.use("/api/reports", require("./routes/reports.routes"));
app.use("/api/admin", require("./routes/admin.routes"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API started on port ${PORT}`));
