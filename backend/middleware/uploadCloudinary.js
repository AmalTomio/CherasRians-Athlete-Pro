const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const createCloudinaryUpload = (folder) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async () => ({
      folder,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "jfif"],
    }),
  });

  return multer({
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (_, file, cb) => {
      if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Only image files allowed"), false);
      }

      cb(null, true);
    },
  });
};

module.exports = createCloudinaryUpload;
