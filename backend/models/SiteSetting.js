const mongoose = require('mongoose');

const SiteSettingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // e.g., 'global'
    settings: {
        showHero: { type: Boolean, default: true },
        showWeeklyFeatured: { type: Boolean, default: true },
        showRankings: { type: Boolean, default: true },
        showRising: { type: Boolean, default: true },
        showTags: { type: Boolean, default: true },
        showPromo: { type: Boolean, default: true },
        enablePayments: { type: Boolean, default: true },
        showDemoCredentials: { type: Boolean, default: true },
        showChapterSummary: { type: Boolean, default: true },
        theme: { type: String, default: 'default' } // 'default' or 'unique'
    }
});

module.exports = mongoose.model('SiteSetting', SiteSettingSchema);
