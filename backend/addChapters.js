const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Novel = require('./models/Novel');
const Chapter = require('./models/Chapter');

const addChapters = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Get all novels
        const novels = await Novel.find();
        
        if (novels.length === 0) {
            console.log('No novels found. Please run seed.js first.');
            process.exit(1);
        }

        // Clear existing chapters
        await Chapter.deleteMany({});
        console.log('Cleared existing chapters');

        let totalChapters = 0;

        // Add chapters for each novel
        for (const novel of novels) {
            console.log(`\nAdding chapters for: ${novel.title}`);
            
            const chapters = generateChaptersForNovel(novel);
            await Chapter.insertMany(chapters);
            
            console.log(`✓ Added ${chapters.length} chapters`);
            totalChapters += chapters.length;
        }

        console.log(`\n🎉 Successfully added ${totalChapters} chapters across ${novels.length} novels!`);
        process.exit(0);
    } catch (err) {
        console.error('Error adding chapters:', err);
        process.exit(1);
    }
};

function generateChaptersForNovel(novel) {
    const chapters = [];
    let order = 1;

    // Determine number of volumes and chapters based on novel
    const volumeConfig = getVolumeConfig(novel.title);

    volumeConfig.forEach((volumeData, volumeIndex) => {
        const volumeName = `Volume ${volumeIndex + 1}`;
        
        volumeData.chapters.forEach((chapterData, chapterIndex) => {
            chapters.push({
                novelId: novel._id,
                title: `Chapter ${order}: ${chapterData.title}`,
                content: generateChapterContent(chapterData.title, chapterData.content),
                order: order,
                isPaid: chapterData.isPaid,
                price: chapterData.price,
                volume: volumeName
            });
            order++;
        });
    });

    return chapters;
}

function getVolumeConfig(novelTitle) {
    // Different chapter configurations for different novels
    
    if (novelTitle.includes('Shadow Monarch')) {
        return [
            {
                name: 'Volume 1: The Awakening',
                chapters: [
                    { title: 'The Weakest Hunter', isPaid: false, price: 0, content: 'Jin-Woo struggles as the weakest E-rank hunter, barely making ends meet.' },
                    { title: 'The Double Dungeon', isPaid: false, price: 0, content: 'A routine raid turns deadly when they discover a hidden dungeon.' },
                    { title: 'The System Awakens', isPaid: false, price: 0, content: 'On the brink of death, Jin-Woo receives a mysterious system.' },
                    { title: 'Daily Quest', isPaid: true, price: 5, content: 'Jin-Woo must complete brutal daily quests or face penalties.' },
                    { title: 'First Level Up', isPaid: true, price: 5, content: 'After completing quests, Jin-Woo experiences his first level up.' },
                    { title: 'The Penalty Zone', isPaid: true, price: 5, content: 'Jin-Woo fails a quest and is transported to a deadly penalty zone.' },
                    { title: 'Survival Training', isPaid: true, price: 5, content: 'Fighting for his life against giant centipedes.' },
                    { title: 'New Powers', isPaid: true, price: 5, content: 'Jin-Woo discovers his growing strength and new abilities.' }
                ]
            },
            {
                name: 'Volume 2: Rising Power',
                chapters: [
                    { title: 'Return to Dungeons', isPaid: true, price: 5, content: 'Jin-Woo returns to dungeon raiding with newfound confidence.' },
                    { title: 'The C-Rank Gate', isPaid: true, price: 5, content: 'His first solo C-rank dungeon proves his growth.' },
                    { title: 'Shadow Extraction', isPaid: true, price: 10, content: 'Jin-Woo unlocks the ability to extract shadows from defeated enemies.' },
                    { title: 'Building an Army', isPaid: true, price: 10, content: 'He begins collecting shadow soldiers.' },
                    { title: 'The Job Change Quest', isPaid: true, price: 10, content: 'A special quest offers Jin-Woo a class change opportunity.' },
                    { title: 'Becoming the Shadow Monarch', isPaid: true, price: 10, content: 'Jin-Woo completes the quest and gains his true class.' }
                ]
            },
            {
                name: 'Volume 3: The Red Gate',
                chapters: [
                    { title: 'Trapped in Ice', isPaid: true, price: 10, content: 'A Red Gate traps Jin-Woo and other hunters in a frozen wasteland.' },
                    { title: 'The Ice Elves', isPaid: true, price: 10, content: 'They encounter deadly ice elf warriors.' },
                    { title: 'Leading the Survivors', isPaid: true, price: 10, content: 'Jin-Woo takes charge to keep everyone alive.' },
                    { title: 'The Ice Monarch', isPaid: true, price: 15, content: 'The final boss of the Red Gate appears.' },
                    { title: 'Victory and Escape', isPaid: true, price: 15, content: 'Jin-Woo defeats the Ice Monarch and saves everyone.' }
                ]
            }
        ];
    }
    
    if (novelTitle.includes('Cultivation Chronicles')) {
        return [
            {
                name: 'Volume 1: Mortal Realm',
                chapters: [
                    { title: 'The Outer Disciple', isPaid: false, price: 0, content: 'Li Wei begins his journey as the lowest ranked disciple.' },
                    { title: 'First Breakthrough', isPaid: false, price: 0, content: 'He achieves his first cultivation breakthrough.' },
                    { title: 'Sect Competition', isPaid: true, price: 5, content: 'Li Wei enters the annual sect competition.' },
                    { title: 'Hidden Technique', isPaid: true, price: 5, content: 'He discovers an ancient cultivation manual.' },
                    { title: 'Foundation Establishment', isPaid: true, price: 5, content: 'Li Wei breaks through to Foundation Establishment realm.' },
                    { title: 'Inner Sect Promotion', isPaid: true, price: 5, content: 'His achievements earn him a promotion to inner sect.' }
                ]
            },
            {
                name: 'Volume 2: Spirit Realm',
                chapters: [
                    { title: 'The Secret Realm Opens', isPaid: true, price: 10, content: 'A legendary secret realm appears after 1000 years.' },
                    { title: 'Ancient Treasures', isPaid: true, price: 10, content: 'Li Wei explores ruins filled with treasures and dangers.' },
                    { title: 'Rival Sects', isPaid: true, price: 10, content: 'Competition with disciples from other sects intensifies.' },
                    { title: 'The Dragon Bloodline', isPaid: true, price: 15, content: 'Li Wei awakens a dormant dragon bloodline.' },
                    { title: 'Core Formation', isPaid: true, price: 15, content: 'He breaks through to Core Formation realm.' }
                ]
            }
        ];
    }
    
    if (novelTitle.includes('Regression')) {
        return [
            {
                name: 'Volume 1: Return to the Past',
                chapters: [
                    { title: 'The Final Battle', isPaid: false, price: 0, content: 'The legendary swordsman falls in the last battle against demons.' },
                    { title: 'Regression', isPaid: false, price: 0, content: 'He wakes up as his 16-year-old self.' },
                    { title: 'Second Chance', isPaid: false, price: 0, content: 'Armed with future knowledge, he begins changing his fate.' },
                    { title: 'Academy Entrance', isPaid: true, price: 5, content: 'He enters the prestigious magic academy.' },
                    { title: 'Shocking the Instructors', isPaid: true, price: 5, content: 'His skills far exceed what a beginner should have.' },
                    { title: 'Preventing Disaster', isPaid: true, price: 5, content: 'He stops a tragedy he failed to prevent in his past life.' }
                ]
            },
            {
                name: 'Volume 2: Changing Fate',
                chapters: [
                    { title: 'The Demon Cult', isPaid: true, price: 10, content: 'He infiltrates the demon cult to gather intelligence.' },
                    { title: 'Saving Allies', isPaid: true, price: 10, content: 'He saves people who died in his previous timeline.' },
                    { title: 'The Sword Saint', isPaid: true, price: 10, content: 'He meets his former master, now just a young swordsman.' },
                    { title: 'New Techniques', isPaid: true, price: 15, content: 'Combining past knowledge with new opportunities.' }
                ]
            }
        ];
    }
    
    if (novelTitle.includes('Academy')) {
        return [
            {
                name: 'Volume 1: Undercover Professor',
                chapters: [
                    { title: 'Transmigration', isPaid: false, price: 0, content: 'A modern man wakes up as a professor in a fantasy world.' },
                    { title: 'First Class', isPaid: false, price: 0, content: 'He must teach magic despite being from a world without it.' },
                    { title: 'The Genius Student', isPaid: true, price: 5, content: 'A talented student sees through his facade.' },
                    { title: 'Secret Research', isPaid: true, price: 5, content: 'He discovers the original professor\'s hidden research.' },
                    { title: 'Academy Politics', isPaid: true, price: 5, content: 'Navigating dangerous political games among faculty.' },
                    { title: 'The Hidden Dungeon', isPaid: true, price: 10, content: 'A secret dungeon beneath the academy is discovered.' }
                ]
            },
            {
                name: 'Volume 2: Dark Secrets',
                chapters: [
                    { title: 'Conspiracy Unveiled', isPaid: true, price: 10, content: 'He uncovers a plot threatening the academy.' },
                    { title: 'Protecting Students', isPaid: true, price: 10, content: 'He must save his students from danger.' },
                    { title: 'True Identity', isPaid: true, price: 15, content: 'His real identity begins to surface.' }
                ]
            }
        ];
    }
    
    // Default for Omniscient Reader's Viewpoint or others
    return [
        {
            name: 'Volume 1: The Beginning',
            chapters: [
                { title: 'The Last Reader', isPaid: false, price: 0, content: 'Dokja is the only person who finished reading "Three Ways to Survive the Apocalypse".' },
                { title: 'The World Ends', isPaid: false, price: 0, content: 'The novel becomes reality as the apocalypse begins.' },
                { title: 'First Scenario', isPaid: false, price: 0, content: 'Dokja uses his knowledge to survive the first scenario.' },
                { title: 'Hidden Pieces', isPaid: true, price: 5, content: 'He collects items and allies the protagonist missed.' },
                { title: 'The Protagonist', isPaid: true, price: 5, content: 'He meets Yoo Joonghyuk, the novel\'s main character.' },
                { title: 'Changing the Story', isPaid: true, price: 5, content: 'Dokja begins altering events from the original novel.' }
            ]
        },
        {
            name: 'Volume 2: Scenarios',
            chapters: [
                { title: 'Second Scenario', isPaid: true, price: 10, content: 'The scenarios continue, each more deadly than the last.' },
                { title: 'Building a Team', isPaid: true, price: 10, content: 'Dokja gathers companions to face the challenges.' },
                { title: 'Constellation Sponsorship', isPaid: true, price: 10, content: 'Powerful constellations begin watching and sponsoring him.' },
                { title: 'The Fourth Wall', isPaid: true, price: 15, content: 'Dokja\'s unique skill protects him from mental attacks.' }
            ]
        },
        {
            name: 'Volume 3: The Star Stream',
            chapters: [
                { title: 'Star Stream Revealed', isPaid: true, price: 15, content: 'The true nature of the scenarios is revealed.' },
                { title: 'Constellation Wars', isPaid: true, price: 15, content: 'Conflicts between constellations escalate.' },
                { title: 'The Final Scenario', isPaid: true, price: 20, content: 'The ultimate challenge approaches.' }
            ]
        }
    ];
}

function generateChapterContent(title, summary) {
    return `
        <div class="chapter-content">
            <h2>${title}</h2>
            
            <p>${summary}</p>
            
            <p>The morning sun cast long shadows across the training grounds as our protagonist stood at the precipice of destiny. What had begun as an ordinary day would soon transform into something extraordinary.</p>
            
            <p>Every journey has its beginning, and this was theirs. The path ahead was fraught with danger, but also filled with opportunity. Those who dared to walk it would be forever changed.</p>
            
            <p>"This is just the beginning," they whispered to themselves, determination burning in their eyes.</p>
            
            <hr>
            
            <p><em>The story continues in the next chapter...</em></p>
        </div>
    `;
}

addChapters();
