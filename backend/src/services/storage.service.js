const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");
const fs = require("fs/promises");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function uploadAudio(file) {
  if (!file) throw new Error("Audio file required");

  const bucket = process.env.SUPABASE_BUCKET || "tracks";
  const extension = file.originalname.split(".").pop();
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const filePath = `audio/${fileName}`;

  const fileBuffer = await fs.readFile(file.path);

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, fileBuffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return {
    url: data.publicUrl,
    provider: "supabase-storage",
    key: filePath
  };
}

module.exports = { uploadAudio };
