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

        // Extended Sample Novels for diverse tags
        const extraNovels = [
            {
                title: 'The Silent Assassin',
                author: 'NightWalker',
                description: 'A master assassin seeks redemption in a world ruled by crime syndicates.',
                coverUrl: 'https://picsum.photos/seed/assassin/300/450',
                tags: ['Action', 'Thriller', 'Urban'],
                category: 'Original',
                status: 'Completed',
                views: 55000,
                rating: 4.4
            },
            {
                title: 'Love in the Time of Portals',
                author: 'RoseHeart',
                description: 'Two lovers separated by dimensions try to find their way back to each other.',
                coverUrl: 'https://picsum.photos/seed/portal/300/450',
                tags: ['Romance', 'Sci-Fi', 'Drama'],
                category: 'Original',
                status: 'Ongoing',
                views: 42000,
                rating: 4.7
            },
            {
                title: 'Dungeon Chef',
                author: 'GourmetKing',
                description: 'Cooking the most delicious meals from the most dangerous monsters.',
                coverUrl: 'https://picsum.photos/seed/chef/300/450',
                tags: ['Fantasy', 'Slice of Life', 'Comedy'],
                category: 'Original',
                status: 'Ongoing',
                views: 89000,
                rating: 4.8
            },
            {
                title: 'The Last Starship',
                author: 'SpaceAce',
                description: 'Humanity\'s last hope lies in a derelict ship and its reluctant captain.',
                coverUrl: 'https://picsum.photos/seed/starship/300/450',
                tags: ['Sci-Fi', 'Adventure', 'Mecha'],
                category: 'Original',
                status: 'Ongoing',
                views: 33000,
                rating: 4.2
            },
            {
                title: 'School of Magic and Muscles',
                author: 'FlexMage',
                description: 'Who needs spells when you can punch through magical barriers?',
                coverUrl: 'https://picsum.photos/seed/muscles/300/450',
                tags: ['Action', 'Comedy', 'Academy', 'Magic'],
                category: 'Original',
                status: 'Ongoing',
                views: 67000,
                rating: 4.6
            },
            {
                title: 'Ghostly Roommate',
                author: 'SpookyPen',
                description: 'My new apartment is great, except for the ghost who keeps critiquing my life choices.',
                coverUrl: 'https://picsum.photos/seed/ghost/300/450',
                tags: ['Horror', 'Comedy', 'Supernatural'],
                category: 'Original',
                status: 'Completed',
                views: 28000,
                rating: 4.3
            },
            {
                title: 'System Reborn',
                author: 'CodeMaster',
                description: 'The admin of the world system gets reincarnated as a level 1 slime.',
                coverUrl: 'https://picsum.photos/seed/slime/300/450',
                tags: ['System', 'Fantasy', 'Adventure', 'Reincarnation'],
                category: 'Original',
                status: 'Ongoing',
                views: 112000,
                rating: 4.5
            },
            {
                title: 'Martial God Asura',
                author: 'Kindhearted Bee',
                description: 'Typical young master courting death simulator.',
                coverUrl: 'https://picsum.photos/seed/mga/300/450',
                tags: ['Eastern', 'Xianxia', 'Action', 'Harem'],
                category: 'Translation',
                status: 'Ongoing',
                views: 250000,
                rating: 4.1
            },
            {
                title: 'Villainess Reversal',
                author: 'OtomeFan',
                description: 'Reincarnated as the villainess, I decided to run a bakery instead of ruining the kingdom.',
                coverUrl: 'https://picsum.photos/seed/villainess/300/450',
                tags: ['Romance', 'Fantasy', 'Josei'],
                category: 'Original',
                status: 'Ongoing',
                views: 95000,
                rating: 4.8
            },
            {
                title: 'Cyberpunk Ronin',
                author: 'NeonBlade',
                description: 'A samurai in a neon-soaked future fighting megacorps with a laser katana.',
                coverUrl: 'https://picsum.photos/seed/cyber/300/450',
                tags: ['Sci-Fi', 'Action', 'Cyberpunk'],
                category: 'Original',
                status: 'Completed',
                views: 48000,
                rating: 4.5
            },
            {
                title: 'Infinite Gacha',
                author: 'LuckSacker',
                description: 'I can pull unlimited items from a gacha system in the apocalypse.',
                coverUrl: 'https://picsum.photos/seed/gacha/300/450',
                tags: ['System', 'Action', 'Adventure'],
                category: 'Original',
                status: 'Ongoing',
                views: 105000,
                rating: 4.4
            },
            {
                title: 'Vampire\'s Butler',
                author: 'BloodMoon',
                description: 'Serving a high-maintenance vampire princess is harder than fighting dragon hunters.',
                coverUrl: 'https://picsum.photos/seed/vampire/300/450',
                tags: ['Supernatural', 'Romance', 'Comedy'],
                category: 'Original',
                status: 'Ongoing',
                views: 61000,
                rating: 4.3
            }
        ];

        // Helper to slugify
        const slugify = (text) => {
            return text.toString().toLowerCase()
                .replace(/\s+/g, '-')           // Replace spaces with -
                .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
                .replace(/\-\-+/g, '-')         // Replace multiple - with single -
                .replace(/^-+/, '')             // Trim - from start
                .replace(/-+$/, '');            // Trim - from end
        };

        const allNovels = [...novels, ...extraNovels].map(n => ({
            ...n,
            slug: slugify(n.title)
        }));

        const createdNovels = await Novel.insertMany(allNovels);
        console.log(`✓ Created ${createdNovels.length} novels`);

        // Generate Chapters for ALL novels
        const allChapters = [];
        
        for (const novel of createdNovels) {
            // Generate 3-10 chapters per novel
            const chapterCount = Math.floor(Math.random() * 8) + 3;
            
            for (let i = 1; i <= chapterCount; i++) {
                allChapters.push({
                    novelId: novel._id,
                    title: `Chapter ${i}: The Beginning Part ${i}`,
                    content: `<h2>Chapter ${i}</h2><p>This is the content for chapter ${i} of <strong>${novel.title}</strong>.</p><p>The story continues with intense action and drama...</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
                    order: i,
                    isPaid: i > 2, // First 2 chapters free
                    price: i > 2 ? 5 : 0,
                    volume: 'Volume 1'
                });
            }
        }

        await Chapter.insertMany(allChapters);
        console.log(`✓ Created ${allChapters.length} chapters across ${createdNovels.length} novels`);

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
