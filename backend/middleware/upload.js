const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    // Default folder
    let folder = "uploads/equipment-damage";

    // 🆕 If used for return proof
    if (req.uploadType === "return") {
      folder = "uploads/returns";
    }

    // Ensure folder exists
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },

  filename: (_, file, cb) => {
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (_, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only images allowed"), false);
  }
  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});