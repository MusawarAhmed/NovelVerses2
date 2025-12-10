const mongoose = require('mongoose');
const SiteSetting = require('./models/SiteSetting');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/novelverse';

mongoose.connect(uri)
    .then(async () => {
        console.log('Connected to DB');
        
        // 1. Read current settings
        let setting = await SiteSetting.findOne({ key: 'global' });
        console.log('CURRENT DB SETTINGS (Home Category):', JSON.stringify(setting.settings.featuredConfig?.homeCategorySection, null, 2));

        // 2. Try to update it manually
        if (!setting.settings.featuredConfig) setting.settings.featuredConfig = {};
        
        setting.settings.featuredConfig.homeCategorySection = {
            show: true,
            title: 'Debug Category',
            category: 'Fanfic'
        };
        
        // Mark modified because mixed types or nested updates sometimes tricky in Mongoose
        setting.markModified('settings'); // crucial if 'settings' is a mixed type, but here it is defined in schema.
        // However, 'featuredConfig' is defined in schema.
        
        await setting.save();
        console.log('Saved "Fanfic" to DB.');

        // 3. Read back
        const updated = await SiteSetting.findOne({ key: 'global' });
        console.log('UPDATED DB SETTINGS:', JSON.stringify(updated.settings.featuredConfig?.homeCategorySection, null, 2));
        
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
