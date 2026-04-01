const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});

app.use(cors({
  origin: [
    "http://localhost:3000", 
    "http://127.0.0.1:3000", 
    "http://localhost:3001", 
    "http://localhost:5173",
    "https://urwishrestaurentw.vercel.app",
    "https://urwishrestaurentw.vercel.app/"
  ],
  credentials: true
}));


app.use(express.json());

// Set io in app for access in routes
app.set('io', io);

/* CRON JOBS */
const setupCron = require("./utils/cronJob");
setupCron();

/* DB CONNECT */
console.log("Connecting to MongoDB...");
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000 // Fast fail
})
  .then(() => console.log("✅ MongoDB connected successfully to", process.env.MONGO_URI.split('@')[1]))
  .catch(err => {
    console.error("❌ MongoDB connection error:");
    console.error(err.message);
    process.exit(1); // Exit if DB connection fails
  });

/* ROUTES */
app.use("/api/menu", require("./routes/menu"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/offers", require("./routes/offers"));
app.use("/api/restaurants", require("./routes/restaurants"));
app.use("/api/marketing", require("./routes/marketing"));
app.use("/api/users", require("./routes/users"));

/* SOCKET CONNECTION */
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  
  socket.on("join_kitchen", () => {
    socket.join("kitchen");
    console.log("Joined kitchen room");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* SERVER START — MUST BE LAST */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
