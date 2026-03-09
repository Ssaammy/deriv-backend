// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

/* ================================
   MongoDB Connection
   Make sure to set your MongoDB URI
   in Render Environment Variables as MONGO_URI
================================ */
mongoose.connect("mongodb://samuelmugambi262_db_user:SnZIBHdUMsnWDQdB@ac-p0ron3b-shard-00-00.ptzzbj2.mongodb.net:27017,ac-p0ron3b-shard-00-01.ptzzbj2.mongodb.net:27017,ac-p0ron3b-shard-00-02.ptzzbj2.mongodb.net:27017/?ssl=true&replicaSet=atlas-zqqs93-shard-0&authSource=admin&appName=Cluster0", {
  
})
.then(() => console.log("MongoDB connected ✅"))
.catch((err) => console.log("MongoDB connection error ❌:", err));

/* ================================
   User Schema
================================ */
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  name: String,
  phone: String,
});

const User = mongoose.model("User", userSchema);

/* ================================
   Trade Schema
================================ */
const tradeSchema = new mongoose.Schema({
  userId: String,
  market: String,
  entry: Number,
  exit: Number,
  result: String,
  date: String,
});

const Trade = mongoose.model("Trade", tradeSchema);

/* ================================
   Signup Route
================================ */
app.post("/signup", async (req, res) => {
  try {
    const { email, password, confirmPassword, name, phone } = req.body;

    if (!email || !password || !confirmPassword || !name || !phone) {
      return res.json({ error: "All fields required" });
    }

    if (password !== confirmPassword) {
      return res.json({ error: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ email, password: hashedPassword, name, phone });
    await newUser.save();

    res.json({ message: "Signup successful ✅" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================================
   Login Route
================================ */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.json({ error: "Email not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ error: "Wrong password" });

    res.json({ message: "Login successful ✅", email: user.email });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================================
   Save Trade Route
================================ */
app.post("/save-trade", async (req, res) => {
  try {
    const { userId, market, entry, exit, result } = req.body;

    if (!userId || !market || !entry || !exit || !result) {
      return res.json({ success: false, error: "All fields required" });
    }

    const trade = new Trade({
      userId,
      market,
      entry,
      exit,
      result,
      date: new Date().toLocaleString(),
    });

    await trade.save();
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
});

/* ================================
   Test Route / Default
================================ */
app.get("/", (req, res) => {
  res.json({ status: "Backend running 🚀" });
});

/* ================================
   Start Server
================================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));