const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');  // MongoDB connection

const app = express();

// ------------------ CONNECT TO MONGODB ------------------
connectDB();

// ------------------ MIDDLEWARES ------------------
// Parse JSON requests
app.use(express.json());

// 🟢 FIX: Temporarily set CORS origin to '*' to allow access from all domains 
// (especially for local development or if the frontend URL changes).
// If you want to restrict it later, change '*' back to your specific frontend URL.
app.use(cors({
  origin: '*', // ⬅️ CHANGED TO WILDCARD '*'
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'], // ⬅️ Added common methods
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
