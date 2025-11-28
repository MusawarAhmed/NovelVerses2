const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Novel = require('./models/Novel');

dotenv.config({ path: path.join(__dirname, '.env') });

const slugify = (text) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
};

const migrateSlugs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const novels = await Novel.find({});
        console.log(`Found ${novels.length} novels to check.`);

        let updatedCount = 0;
        for (const novel of novels) {
            if (!novel.slug) {
                let slug = slugify(novel.title);
                
                // Check for duplicates (simple check)
                const existing = await Novel.findOne({ slug, _id: { $ne: novel._id } });
                if (existing) {
                    slug = `${slug}-${novel._id.toString().slice(-4)}`;
                }

                novel.slug = slug;
                await novel.save();
                console.log(`Updated: ${novel.title} -> ${slug}`);
                updatedCount++;
            }
        }

        console.log(`Migration complete. Updated ${updatedCount} novels.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

migrateSlugs();
