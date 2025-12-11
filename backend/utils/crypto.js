// backend/utils/crypto.js
const crypto = require("crypto");

const ALGO = "aes-256-cbc";
const SECRET = process.env.CRYPTO_SECRET || ""; // must be 32 bytes ideally

if (!SECRET || SECRET.length < 32) {
  // Do not throw in require-time for dev convenience, but warn.
  console.warn(
    "CRYPTO_SECRET not set or too short. Set CRYPTO_SECRET in .env (32 chars recommended)."
  );
}

function encrypt(text) {
  if (!text) return null;
  const key = Buffer.from(SECRET.padEnd(32).slice(0, 32));
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  let encrypted = cipher.update(String(text), "utf8", "base64");
  encrypted += cipher.final("base64");
  const payload = iv.toString("base64") + ":" + encrypted;
  return payload;
}

function decrypt(payload) {
  if (!payload) return null;
  try {
    const [ivB64, encrypted] = payload.split(":");
    const iv = Buffer.from(ivB64, "base64");
    const key = Buffer.from(SECRET.padEnd(32).slice(0, 32));
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    let dec = decipher.update(encrypted, "base64", "utf8");
    dec += decipher.final("utf8");
    return dec;
  } catch (err) {
    console.error("Decrypt error:", err);
    return null;
  }
}

module.exports = { encrypt, decrypt };
