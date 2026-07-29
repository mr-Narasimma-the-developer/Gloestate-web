const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Multer handles "multipart/form-data" -- the format browsers use to send files.
// Express's built-in express.json() CANNOT parse file uploads, which is why
// we need this separate middleware just for routes that accept images.
//
// CloudinaryStorage plugs into multer so files are streamed DIRECTLY to
// Cloudinary instead of being saved to our server's disk first.
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gloaro-realestate/properties", // organizes uploads inside your Cloudinary account
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1600, height: 1200, crop: "limit" }], // caps upload size server-side
  },
});

// .array("images", 8) means: accept up to 8 files, all under the form field name "images"
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

module.exports = upload;
