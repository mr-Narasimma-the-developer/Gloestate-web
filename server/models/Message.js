const mongoose = require("mongoose");

// This is the core of your "buyer shows interest -> seller gets it" requirement.
// Every inquiry AND every reply is stored as one Message document.
const messageSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false, // Lets the seller dashboard show "unread" badges
    },
  },
  { timestamps: true }
);

// Fast lookup of "all messages for property X between buyer Y and seller Z"
messageSchema.index({ property: 1, sender: 1, receiver: 1 });

module.exports = mongoose.model("Message", messageSchema);
