const Message = require("../models/Message");
const Property = require("../models/Property");
const User = require("../models/User");
const sendEmail = require("../config/mailer");
const { emitToUser } = require("../socket");

const populateMessage = (message) =>
  Message.findById(message._id)
    .populate("sender", "name email")
    .populate("receiver", "name email")
    .populate("property", "title price city");

const sendMessage = async (req, res) => {
  try {
    const { propertyId, content } = req.body;

    if (!propertyId || !content) {
      return res.status(400).json({ message: "propertyId and content are required" });
    }

    const property = await Property.findById(propertyId).populate("seller", "name email");
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot message yourself about your own property" });
    }

    let message = await Message.create({
      property: propertyId,
      sender: req.user._id,
      receiver: property.seller._id,
      content,
    });

    message = await populateMessage(message);

    emitToUser(property.seller._id.toString(), "newMessage", message);

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
      .sort({ createdAt: 1 });

    await Message.updateMany(
      { property: propertyId, sender: otherUserId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching conversation", error: error.message });
  }
};

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

    let message = await Message.create({
      property: propertyId,
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    message = await populateMessage(message);

    emitToUser(receiverId, "newMessage", message);

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