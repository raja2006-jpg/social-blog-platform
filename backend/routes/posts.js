const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");

// ------------------ CREATE a new post ------------------
router.post("/", authMiddleware, async (req, res) => {
  const { content, image } = req.body;

  try {
    const post = new Post({
      user: req.user.id,          // user ID from token
      username: req.user.username || "Anonymous", // optional username
      content,
      image,
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Only owner or admin can edit
    if (post.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { content, image } = req.body;
    if (content) post.content = content;
    if (image) post.image = image;

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

    // Only owner or admin can delete
    if (post.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await post.remove();
    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
