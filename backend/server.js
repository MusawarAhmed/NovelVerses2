const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load .env file explicitly
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/novelverse';

console.log('Attempting to connect to MongoDB...');
console.log('URI (first 30 chars):', uri.substring(0, 30) + '...');

mongoose.connect(uri)
.then(() => console.log('MongoDB Connected Successfully!'))
.catch(err => console.error('MongoDB connection error:', err));

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
