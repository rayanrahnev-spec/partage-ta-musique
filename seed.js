const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const fs = require("fs");

function getClient() {
  return new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || "demo",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "demo"
    }
  });
}

async function uploadAudio(file) {
  if (!file) throw new Error("Audio file required");
  if (!process.env.R2_BUCKET || !process.env.R2_ENDPOINT) {
    return { url: `/uploads/${file.filename}`, provider: "local-demo" };
  }
  const key = `tracks/${Date.now()}-${crypto.randomUUID()}-${file.originalname}`;
  await getClient().send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Body: fs.createReadStream(file.path),
    ContentType: file.mimetype
  }));
  return { url: `${process.env.R2_PUBLIC_URL}/${key}`, provider: "cloudflare-r2", key };
}
module.exports = { uploadAudio };
