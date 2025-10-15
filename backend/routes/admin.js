const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const adminMiddleware = require('../middleware/adminMiddleware');

// =======================
// Users Management
// =======================

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Admin
router.delete('/users/:id', adminMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.remove();
        res.status(200).json({ message: 'User deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// =======================
// Posts Management
// =======================

// @route   GET /api/admin/posts
// @desc    Get all posts
// @access  Admin
router.get('/posts', adminMiddleware, async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/admin/posts/:id
// @desc    Delete any post
// @access  Admin
router.delete('/posts/:id', adminMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        await post.remove();
        res.status(200).json({ message: 'Post deleted by admin' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
