const axios = require('axios');

const testAnnouncement = async () => {
    try {
        // 1. Login as admin
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@novelverse.com',
            password: 'admin'
        });
        const token = loginRes.data.token;
        console.log('Logged in as admin');

        // 2. Send announcement
        const announcementRes = await axios.post('http://localhost:5000/api/notifications/announcement', {
            title: 'Script Test Announcement',
            message: 'Testing from script'
        }, {
            headers: { 'x-auth-token': token }
        });
        console.log('Announcement response:', announcementRes.data);

        // 3. Check notifications
        const notifRes = await axios.get('http://localhost:5000/api/notifications', {
            headers: { 'x-auth-token': token }
        });
        console.log(`Found ${notifRes.data.length} notifications for admin:`);
        notifRes.data.forEach(n => console.log(`- ${n.title}: ${n.message}`));

    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
};

testAnnouncement();
