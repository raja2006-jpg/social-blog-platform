const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ---------------- MULTER STORAGE ----------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ---------------- CREATE POST ----------------
router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const { content } = req.body;
    const file = req.file;

    if (!content && !file)
      return res.status(400).json({ message: "Post cannot be empty" });

    const post = new Post({
      user: req.user._id,
      username: req.user.username,
      content: content || "",
    });

    if (file) {
      post.fileUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
      post.fileType = file.mimetype;
    }

    await post.save();
    return res.status(201).json(post);
  } catch (err) {
    console.error("Create post error:", err);
    return res.status(500).json({ message: "Failed to create post" });
  }
});

// ---------------- GET ALL POSTS (PUBLIC) ----------------
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username email isAdmin")
      .sort({ createdAt: -1 });

    return res.status(200).json(posts);
  } catch (err) {
    console.error("Fetch posts error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ---------------- UPDATE POST ----------------
router.put("/:id", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.user._id.toString() && !req.user.isAdmin)
      return res.status(401).json({ message: "Not authorized" });

    const { content } = req.body;
    const file = req.file;

    if (content) post.content = content;

    if (file) {
      post.fileUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
      post.fileType = file.mimetype;
    }

    await post.save();
    return res.status(200).json(post);
  } catch (err) {
    console.error("Update post error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ---------------- DELETE POST ----------------
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.user._id.toString() && !req.user.isAdmin)
      return res.status(401).json({ message: "Not authorized" });

    if (post.fileUrl) {
      const fileName = post.fileUrl.split("/uploads/")[1];
      const filePath = path.join(__dirname, "../uploads", fileName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await post.deleteOne();
    return res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.error("Delete post error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
