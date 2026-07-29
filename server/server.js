require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Connect to MongoDB Atlas before anything else runs.
connectDB();

const app = express();

// MIDDLEWARE (application-level, runs on EVERY request):
// app.use(cors({ origin: process.env.CLIENT_URL || "*" })); // allows the React app (different port/domain) to call this API
const allowedOrigins = [
  "http://localhost:5173",
  "https://gloestate-web.vercel.app",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json()); // parses incoming JSON request bodies into req.body

// ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/properties", require("./routes/propertyRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

app.get("/", (req, res) => {
  res.send("Gloaro Real Estate API is running");
});

// GLOBAL ERROR HANDLER: Express calls this if any route calls next(err),
// or throws inside an async function wrapped properly. Keeps error
// responses consistent instead of leaking stack traces to the client.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ message: err.message || "Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
