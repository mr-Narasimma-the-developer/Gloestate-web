const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    seller: {
      // This stores the MongoDB _id of the User who owns this listing.
      // 'ref: "User"' tells Mongoose this ID points to a document in the User collection,
      // which enables .populate("seller") later to pull in the seller's full details.
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    propertyType: {
      type: String,
      enum: ["apartment", "house", "villa", "plot", "commercial"],
      required: true,
    },
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    areaSqft: { type: Number, required: true },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    parking: { type: Boolean, default: false },
    facing: {
      type: String,
      enum: ["north", "south", "east", "west", "north-east", "north-west", "south-east", "south-west", ""],
      default: "",
    },
    furnishing: {
      type: String,
      enum: ["unfurnished", "semi-furnished", "furnished"],
      default: "unfurnished",
    },
    possessionStatus: {
      type: String,
      enum: ["ready-to-move", "under-construction"],
      default: "ready-to-move",
    },
    floorNumber: { type: Number, default: null },
    totalFloors: { type: Number, default: null },
    amenities: [{ type: String }], // e.g. ["lift", "power backup", "garden"]
    images: [
      {
        url: { type: String, required: true }, // Cloudinary secure_url
        publicId: { type: String, required: true }, // Cloudinary public_id, needed to delete the image later
      },
    ],
    status: {
      type: String,
      enum: ["available", "sold"],
      default: "available",
    },
  },
  { timestamps: true }
);

// Index frequently-searched fields so filter queries stay fast as listings grow.
propertySchema.index({ city: 1, price: 1, propertyType: 1 });

module.exports = mongoose.model("Property", propertySchema);
