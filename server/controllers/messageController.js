const Message = require("../models/Message");
const Property = require("../models/Property");
const User = require("../models/User");
const sendEmail = require("../config/mailer");

// @route   POST /api/messages
// @access  Private (buyer only)
// This is the core action: a buyer expresses interest in a property,
// which creates a Message document AND triggers an email to the seller.
const sendMessage = async (req, res) => {
  try {
    const { propertyId, content } = req.body;

    if (!propertyId || !content) {
      return res.status(400).json({ message: "propertyId and content are required" });
    }

    // We need the property to find out WHO the seller is -- the frontend
    // only sends the property id, never the seller's id directly. Never trust
    // the client to tell us who the receiver should be; derive it server-side.
    const property = await Property.findById(propertyId).populate("seller", "name email");
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Prevent a seller from "inquiring" about their own listing.
    if (property.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot message yourself about your own property" });
    }

    const message = await Message.create({
      property: propertyId,
      sender: req.user._id, // the logged-in buyer, taken from the JWT via 'protect' middleware
      receiver: property.seller._id,
      content,
    });

    // Fire the email AFTER the message is safely saved to the database.
    // This way, even if the email fails (wrong SMTP creds, network issue),
    // the actual inquiry is not lost -- the seller can still see it by logging in.
    await sendEmail({
      to: property.seller.email,
      subject: `New inquiry on your property: ${property.title}`,
      html: `
        <h3>You have a new inquiry</h3>
        <p><strong>${req.user.name}</strong> is interested in your property "<strong>${property.title}</strong>".</p>
        <p>Message: "${content}"</p>
        <p>Log in to your Gloaro Real Estate dashboard to reply.</p>
      `,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error: error.message });
  }
};

// @route   GET /api/messages/inbox
// @access  Private (any logged-in user -- works for both buyer and seller)
// Returns every conversation thread the logged-in user is part of, either as sender or receiver.
const getInbox = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .populate("property", "title price city")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching inbox", error: error.message });
  }
};

// @route   GET /api/messages/conversation/:propertyId/:otherUserId
// @access  Private
// Fetches the full back-and-forth thread between the logged-in user and one
// other person, about one specific property -- this is what a chat-style UI needs.
const getConversation = async (req, res) => {
  try {
    const { propertyId, otherUserId } = req.params;

    const messages = await Message.find({
      property: propertyId,
      $or: [
        { sender: req.user._id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user._id },
      ],
    })
      .populate("sender", "name email")
      .sort({ createdAt: 1 }); // oldest first, so it reads top-to-bottom like a chat

    // Mark all messages sent TO the logged-in user in this thread as read.
    await Message.updateMany(
      { property: propertyId, sender: otherUserId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching conversation", error: error.message });
  }
};

// @route   POST /api/messages/reply
// @access  Private (typically the seller replying to a buyer, but works either direction)
const replyMessage = async (req, res) => {
  try {
    const { propertyId, receiverId, content } = req.body;

    if (!propertyId || !receiverId || !content) {
      return res.status(400).json({ message: "propertyId, receiverId and content are required" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    const message = await Message.create({
      property: propertyId,
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    await sendEmail({
      to: receiver.email,
      subject: `New reply from ${req.user.name}`,
      html: `
        <h3>You have a new reply</h3>
        <p><strong>${req.user.name}</strong> replied: "${content}"</p>
        <p>Log in to your Gloaro Real Estate dashboard to view the full conversation.</p>
      `,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Error sending reply", error: error.message });
  }
};

module.exports = { sendMessage, getInbox, getConversation, replyMessage };