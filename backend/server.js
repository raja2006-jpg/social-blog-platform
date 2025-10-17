const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');  // MongoDB connection

const app = express();

// ------------------ CONNECT TO MONGODB ------------------
connectDB();

// ------------------ MIDDLEWARES ------------------
// Parse JSON requests
app.use(express.json());

// ✅ Enable CORS for your Vercel frontend (remove trailing '/')
app.use(cors({
  origin: "https://social-blog-platform-3.onrender.com", // ✅ no slash at end
  credentials: true
}));

// ------------------ ROUTES ------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));

// ------------------ TEST ROUTE ------------------
app.get('/', (req, res) => {
  res.send('🚀 Backend Server is Running Successfully!');
});

// ------------------ START SERVER ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
