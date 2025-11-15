const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require("path");

const app = express();

// Connect to DB
connectDB();

// Middlewares
app.use(express.json());

// Serve uploaded files correctly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// FIXED CORS ORIGIN
app.use(cors({
  origin: [
    "https://social-blog-platform.onrender.com",
    "https://social-blog-platform-3.onrender.com",
    "http://localhost:3000"
  ],
  credentials: true
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));

// Test route
app.get('/', (req, res) => {
  res.send('🚀 Backend Server is Running Successfully!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
