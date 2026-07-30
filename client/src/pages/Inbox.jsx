import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { getInbox, getConversation, replyMessage } from "../api/messageApi";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import "./Inbox.css";

const Inbox = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeThread, setActiveThread] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [sendError, setSendError] = useState("");

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const buildThreads = (messages) => {
    const map = new Map();

    for (const msg of messages) {
      if (!msg.property || !msg.sender || !msg.receiver) continue;

      const isSender = msg.sender._id === user._id;
      const otherUser = isSender ? msg.receiver : msg.sender;
      const key = `${msg.property._id}_${otherUser._id}`;

      if (!map.has(key)) {
        map.set(key, {
          propertyId: msg.property._id,
          propertyTitle: msg.property.title,
          otherUserId: otherUser._id,
          otherUserName: otherUser.name,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
        });
      }
    }

    return Array.from(map.values());
  };

  const loadInbox = () => {
    setLoading(true);
    getInbox()
      .then((res) => setThreads(buildThreads(res.data)))
      .catch((err) => console.error("Failed to load inbox:", err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInbox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      loadInbox();

      setActiveThread((current) => {
        if (!current) return current;

        const isSender = message.sender._id === user._id;
        const otherUserId = isSender ? message.receiver._id : message.sender._id;

        if (current.propertyId === message.property._id && current.otherUserId === otherUserId) {
          setConversation((prev) => [...prev, message]);
        }

        return current;
      });
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const openThread = (thread) => {
    setActiveThread(thread);
    setConversationLoading(true);
    getConversation(thread.propertyId, thread.otherUserId)
      .then((res) => setConversation(res.data))
      .catch((err) => console.error("Failed to load conversation:", err.message))
      .finally(() => setConversationLoading(false));
  };

  const onReply = async (data) => {
    setSendError("");
    try {
      await replyMessage({
        propertyId: activeThread.propertyId,
        receiverId: activeThread.otherUserId,
        content: data.content,
      });
      reset();
      openThread(activeThread);
      loadInbox();
    } catch (err) {
      setSendError(err.response?.data?.message || "Failed to send reply");
    }
  };

  return (
    <div className="container mt-lg" style={{ paddingBottom: "24px" }}>
      <h1 className="mb-lg">Inbox</h1>

      <div className="inbox-layout">
        <div className="thread-list" style={{ display: activeThread ? "none" : "block" }}>
          {loading ? (
            <p style={{ padding: "16px" }}>Loading...</p>
          ) : threads.length === 0 ? (
            <p style={{ padding: "16px" }} className="text-muted">No conversations yet.</p>
          ) : (
            threads.map((thread) => (
              <div
                key={`${thread.propertyId}_${thread.otherUserId}`}
                className={`thread-item ${activeThread?.otherUserId === thread.otherUserId ? "active" : ""}`}
                onClick={() => openThread(thread)}
              >
                <div className="thread-item-top">
                  <span>{thread.otherUserName}</span>
                </div>
                <div className="thread-item-property">{thread.propertyTitle}</div>
                <div className="thread-item-preview">{thread.lastMessage}</div>
              </div>
            ))
          )}
        </div>

        <div className={`chat-panel ${activeThread ? "open" : ""}`}>
          {!activeThread ? (
            <div style={{ margin: "auto", color: "var(--color-text-muted)" }}>
              Select a conversation to view messages
            </div>
          ) : (
            <>
              <div className="chat-header">
                <button className="back-to-threads btn btn-outline" onClick={() => setActiveThread(null)}>
                  ← Back
                </button>
                <div className="chat-header-name">{activeThread.otherUserName}</div>
                <div className="chat-header-property">Re: {activeThread.propertyTitle}</div>
              </div>

              <div className="chat-messages">
                {conversationLoading ? (
                  <p className="text-muted">Loading...</p>
                ) : (
                  conversation.map((msg) => (
                    <div
                      key={msg._id}
                      className={`chat-bubble ${msg.sender._id === user._id ? "mine" : "theirs"}`}
                    >
                      {msg.content}
                    </div>
                  ))
                )}
              </div>

              <form className="chat-input-row" onSubmit={handleSubmit(onReply)}>
                <textarea
                  className="form-textarea"
                  placeholder="Type a reply..."
                  {...register("content", { required: true })}
                />
                <button className="btn btn-primary" disabled={isSubmitting}>Send</button>
              </form>
              {sendError && <p className="form-error" style={{ padding: "0 16px 8px" }}>{sendError}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;