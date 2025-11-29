const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load .env file explicitly
// In Vercel, secrets are env vars, so this is mostly for local dev
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: path.join(__dirname, '.env') });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection (Serverless Optimized)
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/novelverse';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      console.log('MongoDB Connected Successfully!');
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Connect immediately (but don't await here to avoid blocking startup)
connectDB();

// Add a simple test route to verify backend is alive
app.get('/api/test', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running!', time: new Date().toISOString() });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/novels', require('./routes/novels'));
app.use('/api/chapters', require('./routes/chapters'));
app.use('/api/users', require('./routes/users'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));

app.get('/', (req, res) => {
    res.send('NovelVerse API is running');
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
