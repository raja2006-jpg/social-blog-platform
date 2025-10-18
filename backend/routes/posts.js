const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ===== Multer Setup =====
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads");
    // Ensure uploads folder exists
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

// ------------------ CREATE a new post ------------------
router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const { content } = req.body;
    const file = req.file;

    const newPost = new Post({
      user: req.user.id,
      username: req.user.username || "Anonymous",
      content: content || "",
    });

    if (file) {
      newPost.fileUrl = `/uploads/${file.filename}`; // saved path for frontend
      newPost.fileType = file.mimetype;              // can check type on frontend
    }

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create post" });
  }
});

// ------------------ GET all posts ------------------
router.get("/", authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ UPDATE a post ------------------
router.put("/:id", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.user.id && !req.user.isAdmin)
      return res.status(401).json({ message: "Not authorized" });

    const { content } = req.body;
    const file = req.file;

    if (content) post.content = content;
    if (file) {
      post.fileUrl = `/uploads/${file.filename}`;
      post.fileType = file.mimetype;
    }

    await post.save();
    res.status(200).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ DELETE a post ------------------
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.user.id && !req.user.isAdmin)
      return res.status(401).json({ message: "Not authorized" });

    // Optionally remove file from uploads folder
    if (post.fileUrl) {
      const filePath = path.join(__dirname, "..", post.fileUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await post.remove();
    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
