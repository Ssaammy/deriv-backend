// server.js
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect("mongodb://samuelmugambi262_db_user:SnZIBHdUMsnWDQdB@ac-p0ron3b-shard-00-00.ptzzbj2.mongodb.net:27017,ac-p0ron3b-shard-00-01.ptzzbj2.mongodb.net:27017,ac-p0ron3b-shard-00-02.ptzzbj2.mongodb.net:27017/?ssl=true&replicaSet=atlas-zqqs93-shard-0&authSource=admin&appName=Cluster0", {
  
})
.then(() => console.log("MongoDB connected ✅"))
.catch(err => console.error("MongoDB connection error ❌:", err));

// Schemas
const userSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: { type: String, unique: true },
  password: String
});

const tradeSchema = new mongoose.Schema({
  userId: String,
  market: String,
  entry: Number,
  exit: Number,
  result: String,
  createdAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model("User", userSchema);
const Trade = mongoose.model("Trade", tradeSchema);

// Routes

// Signup
app.post("/signup", async (req, res) => {
  try {
    const { name, phone, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, phone, email, password: hashed });
    await user.save();
    res.json({ success: true, message: "Signup successful ✅", userId: user._id });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      res.status(400).json({ success: false, message: "Email already exists" });
    } else {
      res.status(500).json({ success: false, message: "Signup failed" });
    }
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: "Incorrect password" });

    res.json({ success: true, message: "Login successful ✅", userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

// Save Trade
app.post("/save-trade", async (req, res) => {
  try {
    const { userId, market, entry, exit, result } = req.body;
    if (!userId || !market || entry == null || exit == null || !result) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }
    const trade = new Trade({ userId, market, entry, exit, result });
    await trade.save();
    res.json({ success: true, message: "Trade saved ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to save trade" });
  }
});

// Get Trade History
app.get("/get-trades/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const trades = await Trade.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, trades });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch trades" });
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("Deriv Backend is running ✅");
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));