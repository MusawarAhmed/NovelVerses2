const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Notification = require('./models/Notification');

dotenv.config({ path: path.join(__dirname, '.env') });

const checkNotifications = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const notifications = await Notification.find().sort({ createdAt: -1 });
        console.log(`Found ${notifications.length} notifications:`);
        notifications.forEach(n => {
            console.log(`- [${n.type}] ${n.title}: ${n.message} (User: ${n.userId})`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkNotifications();
