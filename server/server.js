require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const connectDB = require("./config/db");
const { initSocket } = require("./socket");

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/properties", require("./routes/propertyRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

app.get("/", (req, res) => {
  res.send("Gloaro Real Estate API is running");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ message: err.message || "Server Error" });
});

const httpServer = http.createServer(app);
initSocket(httpServer);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));