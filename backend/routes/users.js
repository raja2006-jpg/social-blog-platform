const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const bcrypt = require("bcryptjs");

// ---------------- GET /me ----------------
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json(user);
  } catch (err) {
    console.error("GET /me error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ---------------- UPDATE /me ----------------
router.put("/me", authMiddleware, async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: "Email already taken" });
      user.email = email;
    }

    if (username) user.username = username;

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    return res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (err) {
    console.error("PUT /me error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ---------------- EXTRA: Needed for your frontend ----------------
// (PUT /api/users/:id)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.params.id !== req.user.id)
      return res.status(403).json({ message: "Cannot update other users" });

    const { username } = req.body;

    const user = await User.findById(req.user.id);
    user.username = username;
    await user.save();

    return res.status(200).json({ message: "Username updated", username });
  } catch (err) {
    console.error("PUT /:id error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
