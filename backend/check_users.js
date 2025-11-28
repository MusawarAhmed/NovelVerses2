const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const count = await User.countDocuments();
        console.log(`Found ${count} users.`);
        
        const users = await User.find().limit(5);
        users.forEach(u => console.log(`- ${u.username} (${u.email}) [${u.role}]`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
