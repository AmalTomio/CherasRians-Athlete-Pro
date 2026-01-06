const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "uploads/equipment-damage",
  filename: (_, file, cb) => {
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (_, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    cb(new Error("Only images allowed"), false);
  }
  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
