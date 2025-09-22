const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import Passport and your User model
require("./config/passport-setup");
const User = require("./models/user");

// Middlewares
app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use(express.static("public")); // To serve a basic login page or assets

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// --- GOOGLE AUTH ROUTES ---
app.get(
  "/api/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.redirect(`http://localhost:5173/dashboard?token=${token}`); // Make sure to use your Vite frontend URL
  }
);

// --- AI MODEL INTEGRATION ROUTE ---
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

app.post("/api/classify", upload.single("audioFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = req.file.path;
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));

  try {
    // Send file to your Python ML service
    const mlResponse = await axios.post(
      "http://localhost:5000/classify-audio",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    const result = mlResponse.data;
    console.log("ML service returned:", result);

    // Save history to MongoDB for the logged-in user
    // This part requires you to have user sessions or pass the JWT to this route
    // Example (requires more auth logic):
    // const newHistory = { filename: req.file.originalname, result };
    // User.findByIdAndUpdate(req.user.id, { $push: { history: newHistory } });

    res.status(200).json(result);
  } catch (error) {
    console.error(
      "Error with ML service:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Classification failed" });
  } finally {
    // Clean up temporary file
    fs.unlink(filePath, (err) => {
      if (err) console.error("Failed to delete temp file:", err);
    });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
