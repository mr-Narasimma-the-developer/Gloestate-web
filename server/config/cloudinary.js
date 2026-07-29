const cloudinary = require("cloudinary").v2;

// Cloudinary is a cloud image-hosting service. We never store uploaded images
// on our own server disk (Render's filesystem is temporary anyway -- it wipes
// on every redeploy). Instead, images go straight to Cloudinary, and MongoDB
// only stores the resulting URL + publicId.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
