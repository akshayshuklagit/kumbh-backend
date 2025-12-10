const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("./controllers/sendEmail.js");
require("dotenv").config();

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const connectDB = require("./config/database");
const Subscriber = require("./models/Subscriber");
const Contact = require("./models/Contact");
const { authenticateToken } = require("./middleware/auth");
const {
  validateSubscriber,
  validateContact,
} = require("./middleware/validation");

const { createEmailTemplate } = require("./utils/emailTemplate");
const { log } = require("console");
const { loginAdmin } = require("./controllers/loginAdmin.js");
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(compression());
app.use(mongoSanitize());

const allowedOrigins = [
  "https://ayurvedakumbh.in",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Body Parser Middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/admin/login", loginAdmin);

app.post("/api/subscribers", validateSubscriber, async (req, res) => {
  try {
    const { email, name } = req.body;
    const subscriber = new Subscriber({ email, name });
    await subscriber.save();

    // Emit live notification
    const io = req.app.get("io");
    io.emit("newSubscriber", {
      email,
      name,
      time: new Date().toLocaleTimeString(),
    });

    res.json({ success: true, subscriber });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: "Email already subscribed" });
    } else {
      res.status(500).json({ error: "Failed to subscribe" });
    }
  }
});

app.post("/api/contact", validateContact, async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();

    // Emit live notification
    const io = req.app.get("io");
    io.emit("newContact", {
      name: contact.name,
      email: contact.email,
      time: new Date().toLocaleTimeString(),
    });

    res.json({ success: true, id: contact._id });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit contact form" });
  }
});

app.get("/api/admin/stats", authenticateToken, async (req, res) => {
  try {
    const [subscribersCount, contactsCount] = await Promise.all([
      Subscriber.countDocuments(),
      Contact.countDocuments(),
    ]);

    res.json({
      subscribers: subscribersCount,
      contacts: contactsCount,
      todayVisits: dailyStats.visits,
      activeUsers: activeUsers.size,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/track", async (req, res) => {
  const { email, name } = req.query;
  const subscriber = new Subscriber({ email, name });
  await subscriber.save();
  res.json({ success: true, subscriber });
});
app.post(
  "/api/send-bulk-email",
  authenticateToken,
  upload.single("file"),
  sendEmail
);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const io = require("socket.io")(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://ayurvedakumbh.in",
      "https://localhost:5000",
    ],
    methods: ["GET", "POST"],
  },
});
app.set("io", io);

let activeUsers = new Set();
let dailyStats = { visits: 0, subscribers: 0, contacts: 0 };
let recentActivity = [];

io.on("connection", (socket) => {
  activeUsers.add(socket.id);

  socket.emit("liveStats", {
    activeUsers: activeUsers.size,
    todayVisits: dailyStats.visits,
    totalSubscribers: dailyStats.subscribers,
    totalContacts: dailyStats.contacts,
    recentActivity: recentActivity,
  });

  io.emit("activeUsersUpdate", { activeUsers: activeUsers.size });

  socket.on("disconnect", () => {
    activeUsers.delete(socket.id);
    io.emit("activeUsersUpdate", { activeUsers: activeUsers.size });
  });

  socket.on("pageView", (data) => {
    dailyStats.visits++;
    const activity = {
      page: data.page,
      location: data.location || "Unknown",
      time: new Date().toLocaleTimeString(),
      timestamp: Date.now(),
    };
    recentActivity.unshift(activity);
    recentActivity = recentActivity.slice(0, 10);

    io.emit("newVisitor", {
      ...activity,
      activeUsers: activeUsers.size,
    });
  });
});

// Reset daily stats at midnight
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    dailyStats = { visits: 0, subscribers: 0, contacts: 0 };
    recentActivity = [];
  }
}, 60000);
