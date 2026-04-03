/**
 * Database Seeder
 * Creates demo data for testing and development.
 * Run: npm run seed
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const SocialAccount = require('../models/SocialAccount');
const Post = require('../models/Post');
const Analytics = require('../models/Analytics');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await SocialAccount.deleteMany({});
    await Post.deleteMany({});
    await Analytics.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create demo user
    const user = await User.create({
      name: 'Demo User',
      email: 'demo@socialautomation.com',
      password: 'demo123456',
      plan: 'pro',
    });
    console.log(`👤 Created demo user: ${user.email}`);

    // Connect social accounts
    const accounts = await SocialAccount.insertMany([
      {
        userId: user._id,
        platform: 'twitter',
        username: 'demo_user',
        platformUserId: 'tw_demo_123',
        profileUrl: 'https://twitter.com/demo_user',
      },
      {
        userId: user._id,
        platform: 'linkedin',
        username: 'demo-user',
        platformUserId: 'li_demo_456',
        profileUrl: 'https://linkedin.com/in/demo-user',
      },
      {
        userId: user._id,
        platform: 'instagram',
        username: 'demo.user',
        platformUserId: 'ig_demo_789',
        profileUrl: 'https://instagram.com/demo.user',
      },
    ]);
    console.log(`🔗 Connected ${accounts.length} social accounts`);

    // Create sample posts
    const posts = [];
    const statuses = ['draft', 'scheduled', 'published', 'published', 'published'];
    const contents = [
      'Excited to share our latest tech insights! The future of AI in social media is here. 🚀 #AI #SocialMedia #TechTrends',
      'Just launched our new productivity framework. Check out how it can 10x your workflow! 💡 #Productivity #Innovation',
      'Building in public — here\'s our journey so far. Lessons learned, mistakes made, and victories celebrated. 🏆 #BuildInPublic',
      '5 tips for better content creation that actually works. Thread 🧵 #ContentCreation #Marketing',
      'The power of automation in modern marketing. Here\'s how we save 20 hours per week. ⚡ #Automation #MarketingOps',
    ];

    for (let i = 0; i < 5; i++) {
      const platforms = ['twitter', 'linkedin'];
      if (i % 2 === 0) platforms.push('instagram');

      const post = await Post.create({
        userId: user._id,
        content: contents[i],
        platforms,
        status: statuses[i],
        scheduledAt: statuses[i] === 'scheduled' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
        publishedAt: statuses[i] === 'published' ? new Date(Date.now() - i * 24 * 60 * 60 * 1000) : null,
        hashtags: contents[i].match(/#\w+/g) || [],
        aiGenerated: i % 2 === 0,
        platformResults: platforms.map((p) => ({
          platform: p,
          status: statuses[i] === 'published' ? 'success' : 'pending',
          postId: statuses[i] === 'published' ? `${p}_mock_${Date.now()}_${i}` : '',
          url: statuses[i] === 'published' ? `https://${p}.com/p/mock_${i}` : '',
        })),
      });
      posts.push(post);
    }
    console.log(`📝 Created ${posts.length} sample posts`);

    // Create analytics for published posts
    let analyticsCount = 0;
    for (const post of posts.filter((p) => p.status === 'published')) {
      for (const platform of post.platforms) {
        const impressions = Math.floor(Math.random() * 15000) + 1000;
        const likes = Math.floor(Math.random() * impressions * 0.12);
        const comments = Math.floor(Math.random() * likes * 0.35);
        const shares = Math.floor(Math.random() * likes * 0.25);

        await Analytics.create({
          postId: post._id,
          userId: user._id,
          platform,
          metrics: {
            likes,
            comments,
            shares,
            impressions,
            reach: Math.floor(impressions * 0.75),
            clicks: Math.floor(impressions * 0.06),
            engagementRate: parseFloat((((likes + comments + shares) / impressions) * 100).toFixed(2)),
          },
          fetchedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        });
        analyticsCount++;
      }
    }
    console.log(`📊 Created ${analyticsCount} analytics records`);

    console.log('\n🎉 Seed completed successfully!');
    console.log('📧 Login: demo@socialautomation.com / demo123456\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedDB();
