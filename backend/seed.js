const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Novel = require('./models/Novel');
const Chapter = require('./models/Chapter');
const SiteSetting = require('./models/SiteSetting');

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Clear existing data
        await User.deleteMany({});
        await Novel.deleteMany({});
        await Chapter.deleteMany({});
        await SiteSetting.deleteMany({});
        console.log('Cleared existing data');

        // Create Users
        const salt = await bcrypt.genSalt(10);
        
        const adminUser = new User({
            username: 'admin',
            email: 'admin@novelverse.com',
            password: await bcrypt.hash('admin', salt),
            role: 'admin',
            coins: 10000
        });

        const regularUser = new User({
            username: 'reader',
            email: 'reader@novelverse.com',
            password: await bcrypt.hash('user', salt),
            role: 'user',
            coins: 500
        });

        await adminUser.save();
        await regularUser.save();
        console.log('✓ Created demo users');

        // Create Site Settings
        const siteSettings = new SiteSetting({
            key: 'global',
            settings: {
                showHero: true,
                showWeeklyFeatured: true,
                showRankings: true,
                showRising: true,
                showTags: true,
                showPromo: true,
                enablePayments: true,
                showDemoCredentials: true,
                showChapterSummary: true
            }
        });
        await siteSettings.save();
        console.log('✓ Created site settings');

        // Create Sample Novels
        const novels = [
            {
                title: 'Shadow Monarch',
                author: 'Sung Jin-Woo',
                description: 'In a world where hunters fight monsters from gates, the weakest hunter becomes the strongest through a mysterious system.',
                coverUrl: 'https://picsum.photos/seed/shadow/300/450',
                tags: ['Action', 'Fantasy', 'System'],
                category: 'Original',
                status: 'Ongoing',
                views: 125000,
                rating: 4.8,
                isWeeklyFeatured: true
            },
            {
                title: 'Cultivation Chronicles',
                author: 'Li Wei',
                description: 'A young cultivator\'s journey from mortal to immortal, facing trials and tribulations in the path of cultivation.',
                coverUrl: 'https://picsum.photos/seed/cultivation/300/450',
                tags: ['Cultivation', 'Xianxia', 'Adventure'],
                category: 'Translation',
                status: 'Ongoing',
                views: 98000,
                rating: 4.6,
                isWeeklyFeatured: true
            },
            {
                title: 'Regression of the Magic Swordsman',
                author: 'Kim Tae-hyun',
                description: 'After dying in the final battle, a legendary swordsman regresses to his youth with all his memories intact.',
                coverUrl: 'https://picsum.photos/seed/regression/300/450',
                tags: ['Regression', 'Magic', 'Action'],
                category: 'Original',
                status: 'Ongoing',
                views: 87000,
                rating: 4.7,
                isWeeklyFeatured: true
            },
            {
                title: 'The Academy\'s Undercover Professor',
                author: 'Park Min-ho',
                description: 'A modern man transmigrates into a fantasy world as a professor at a prestigious magic academy.',
                coverUrl: 'https://picsum.photos/seed/academy/300/450',
                tags: ['Academy', 'Magic', 'Mystery'],
                category: 'Original',
                status: 'Ongoing',
                views: 76000,
                rating: 4.5
            },
            {
                title: 'Omniscient Reader\'s Viewpoint',
                author: 'Dokja Kim',
                description: 'The only person who finished reading a web novel finds himself living in that very story.',
                coverUrl: 'https://picsum.photos/seed/reader/300/450',
                tags: ['Fantasy', 'System', 'Apocalypse'],
                category: 'Original',
                status: 'Completed',
                views: 150000,
                rating: 4.9,
                isWeeklyFeatured: true
            }
        ];

        const createdNovels = await Novel.insertMany(novels);
        console.log(`✓ Created ${createdNovels.length} novels`);

        // Create Sample Chapters for first novel
        const firstNovel = createdNovels[0];
        const chapters = [
            {
                novelId: firstNovel._id,
                title: 'Chapter 1: The Weakest Hunter',
                content: '<h2>The Weakest Hunter</h2><p>In the year 2025, mysterious gates began appearing around the world, connecting Earth to dungeons filled with monsters. Those who awakened special powers became known as Hunters.</p><p>Among them was Jin-Woo, ranked as the weakest E-rank hunter. Despite the dangers, he continued to enter dungeons to pay for his mother\'s medical bills.</p><p>Little did he know, his life was about to change forever...</p>',
                order: 1,
                isPaid: false,
                price: 0,
                volume: 'Volume 1'
            },
            {
                novelId: firstNovel._id,
                title: 'Chapter 2: The Double Dungeon',
                content: '<h2>The Double Dungeon</h2><p>During a routine D-rank dungeon raid, Jin-Woo and his team discovered a hidden door leading to a second dungeon.</p><p>The statues lining the walls seemed to watch their every move. Ancient inscriptions warned of the rules they must follow to survive.</p><p>But greed and curiosity led them to break the first rule...</p>',
                order: 2,
                isPaid: false,
                price: 0,
                volume: 'Volume 1'
            },
            {
                novelId: firstNovel._id,
                title: 'Chapter 3: The System Awakens',
                content: '<h2>The System Awakens</h2><p>On the brink of death, Jin-Woo was offered a choice by a mysterious system: accept and live, or refuse and die.</p><p>With no other option, he accepted. A blue screen appeared before his eyes, displaying his stats and a quest.</p><p>"Quest: Survive. Reward: ???"</p>',
                order: 3,
                isPaid: true,
                price: 5,
                volume: 'Volume 1'
            },
            {
                novelId: firstNovel._id,
                title: 'Chapter 4: Daily Quest',
                content: '<h2>Daily Quest</h2><p>Jin-Woo woke up in a hospital, alive against all odds. The system was still there, now showing him a daily quest.</p><p>100 push-ups, 100 sit-ups, 100 squats, and a 10km run. Failure would result in a penalty.</p><p>This was just the beginning of his transformation...</p>',
                order: 4,
                isPaid: true,
                price: 5,
                volume: 'Volume 1'
            }
        ];

        await Chapter.insertMany(chapters);
        console.log(`✓ Created ${chapters.length} chapters for "${firstNovel.title}"`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\nDemo Credentials:');
        console.log('Admin: admin@novelverse.com / admin');
        console.log('User: reader@novelverse.com / user');
        
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedDatabase();
