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
        enableTTS: { type: Boolean, default: true },
        showBookSlider: { type: Boolean, default: true },
        showTopUp: { type: Boolean, default: true },
        theme: { type: String, default: 'default' }, // 'default' or 'unique'
        themeSettings: {
            primaryColor: { type: String, default: '#4f46e5' }, // Indigo-600
            secondaryColor: { type: String, default: '#ec4899' }, // Pink-500
            backgroundColor: { type: String, default: '#f8fafc' }, // Slate-50
            textColor: { type: String, default: '#0f172a' }, // Slate-900
            fontFamily: { type: String, default: 'Inter' },
            borderRadius: { type: String, default: '0.5rem' },
        },
        featuredConfig: {
            heroNovelId: { type: String, default: null },
            heroMode: { type: String, enum: ['static', 'slider'], default: 'static' },
            heroSliderIds: [{ type: String }],
            heroTitle: { type: String, default: 'Featured Novel' },
            weeklyNovelIds: [{ type: String }],
            weeklyTitle: { type: String, default: 'Weekly Featured' },
            risingNovelIds: [{ type: String }],
            risingTitle: { type: String, default: 'Rising Stars' },
            sliderNovelIds: [{ type: String }],
            sliderTitle: { type: String, default: 'Popular on NovelVerse' },
            rankingConfig: {
                powerNovelIds: [{ type: String }],
                collectionNovelIds: [{ type: String }],
                activeNovelIds: [{ type: String }],
                ranksTitle: { type: String, default: 'Stats & Rankings' }
            },
            tagConfig: [{ type: String }],
            tagsTitle: { type: String, default: 'Popular Tags' },
            promoConfig: {
                title: { type: String, default: "Meet NovelVerse" },
                content: { type: String, default: "Join thousands of authors and readers. Create your own world, share your stories, and get supported by a vibrant community." },
                primaryButtonText: { type: String, default: "Start Writing" },
                primaryButtonLink: { type: String, default: "/auth" },
                secondaryButtonText: { type: String, default: "Benefits" },
                secondaryButtonLink: { type: String, default: "/search" }
            },
            homeCategorySection: {
                show: { type: Boolean, default: false },
                title: { type: String, default: 'Category Feature' },
                category: { type: String, default: '' }
            }
        }
    }
});

module.exports = mongoose.model('SiteSetting', SiteSettingSchema);
