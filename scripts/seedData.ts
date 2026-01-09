/**
 * Seed Data Script for Skill-Setu Platform
 * Run with: ts-node scripts/seedData.ts
 * Or: node -r ts-node/register scripts/seedData.ts
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Course from '../models/Course';
import Match from '../models/Match';
import Session from '../models/Session';
import dbConnect from '../lib/db';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skill-setu';

const skills = [
  { name: 'JavaScript', category: 'Tech', proficiency: 'Expert' },
  { name: 'React', category: 'Tech', proficiency: 'Advanced' },
  { name: 'Python', category: 'Tech', proficiency: 'Expert' },
  { name: 'Node.js', category: 'Tech', proficiency: 'Advanced' },
  { name: 'Guitar', category: 'Music', proficiency: 'Intermediate' },
  { name: 'Piano', category: 'Music', proficiency: 'Expert' },
  { name: 'Cooking', category: 'Cooking', proficiency: 'Advanced' },
  { name: 'Photography', category: 'Practical', proficiency: 'Intermediate' },
  { name: 'Spanish', category: 'Languages', proficiency: 'Intermediate' },
  { name: 'Public Speaking', category: 'Soft Skills', proficiency: 'Advanced' },
];

const learningSkills = [
  { name: 'TypeScript', category: 'Tech', proficiency: 'Beginner' },
  { name: 'Dancing', category: 'Dance', proficiency: 'Beginner' },
  { name: 'French', category: 'Languages', proficiency: 'Beginner' },
  { name: 'Yoga', category: 'Practical', proficiency: 'Beginner' },
];

async function seedData() {
  try {
    await dbConnect();
    console.log('🗄️  Connected to MongoDB');

    // Clear existing data (optional - comment out to keep existing data)
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Match.deleteMany({});
    await Session.deleteMany({});

    // Create sample users
    console.log('👥 Creating sample users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = await User.insertMany([
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: hashedPassword,
        bio: 'Experienced JavaScript developer and music enthusiast. Love teaching!',
        skills_known: [
          { name: 'JavaScript', category: 'Tech', proficiency: 'expert', verified: true, xp: 500 },
          { name: 'React', category: 'Tech', proficiency: 'advanced', verified: true, xp: 400 },
          { name: 'Guitar', category: 'Music', proficiency: 'intermediate', verified: true, xp: 300 },
        ],
        skills_learning: [
          { name: 'Piano', category: 'Music', proficiency: 'beginner', verified: false, xp: 50 },
          { name: 'French', category: 'Languages', proficiency: 'beginner', verified: false, xp: 20 },
        ],
        tokens: 150,
        reputation: 85,
        progress_tracker: [],
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: hashedPassword,
        bio: 'Python expert and cooking enthusiast. Happy to share knowledge!',
        skills_known: [
          { name: 'Python', category: 'Tech', proficiency: 'expert', verified: true, xp: 600 },
          { name: 'Node.js', category: 'Tech', proficiency: 'advanced', verified: true, xp: 350 },
          { name: 'Cooking', category: 'Cooking', proficiency: 'advanced', verified: true, xp: 450 },
        ],
        skills_learning: [
          { name: 'React', category: 'Tech', proficiency: 'beginner', verified: false, xp: 30 },
          { name: 'Photography', category: 'Practical', proficiency: 'beginner', verified: false, xp: 10 },
        ],
        tokens: 200,
        reputation: 92,
        progress_tracker: [],
      },
      {
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        password: hashedPassword,
        bio: 'Musician and language teacher. Passionate about sharing skills!',
        skills_known: [
          { name: 'Piano', category: 'Music', proficiency: 'expert', verified: true, xp: 700 },
          { name: 'Spanish', category: 'Languages', proficiency: 'intermediate', verified: true, xp: 300 },
          { name: 'Public Speaking', category: 'Soft Skills', proficiency: 'advanced', verified: true, xp: 400 },
        ],
        skills_learning: [
          { name: 'JavaScript', category: 'Tech', proficiency: 'beginner', verified: false, xp: 40 },
          { name: 'Guitar', category: 'Music', proficiency: 'beginner', verified: false, xp: 25 },
        ],
        tokens: 180,
        reputation: 88,
        progress_tracker: [],
      },
      {
        name: 'Diana Prince',
        email: 'diana@example.com',
        password: hashedPassword,
        bio: 'Full-stack developer and photography lover. Always learning!',
        skills_known: [
          { name: 'React', category: 'Tech', proficiency: 'expert', verified: true, xp: 550 },
          { name: 'TypeScript', category: 'Tech', proficiency: 'advanced', verified: true, xp: 400 },
          { name: 'Photography', category: 'Practical', proficiency: 'intermediate', verified: true, xp: 350 },
        ],
        skills_learning: [
          { name: 'Python', category: 'Tech', proficiency: 'beginner', verified: false, xp: 35 },
          { name: 'Cooking', category: 'Cooking', proficiency: 'beginner', verified: false, xp: 15 },
        ],
        tokens: 120,
        reputation: 75,
        progress_tracker: [],
      },
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create sample courses
    console.log('📚 Creating sample courses...');
    const courses = await Course.insertMany([
      {
        title: 'Complete React Masterclass',
        description: 'Learn React from scratch to advanced level. Build real-world projects and master hooks, context, and more.',
        skill: 'React',
        skillCategory: 'Tech',
        creator: users[0]._id,
        price: 50,
        status: 'published',
        modules: [
          {
            title: 'Introduction to React',
            description: 'Get started with React basics',
            order: 0,
            lessons: [
              {
                title: 'What is React?',
                description: 'Understanding React fundamentals',
                order: 0,
                content: { type: 'text', text: 'React is a JavaScript library for building user interfaces...' },
              },
            ],
          },
        ],
        enrolledUsers: [],
        queries: [],
      },
      {
        title: 'Python for Beginners',
        description: 'Start your Python journey with this comprehensive course. Perfect for absolute beginners.',
        skill: 'Python',
        skillCategory: 'Tech',
        creator: users[1]._id,
        price: 40,
        status: 'published',
        modules: [],
        enrolledUsers: [],
        queries: [],
      },
      {
        title: 'Learn Piano in 30 Days',
        description: 'Master piano fundamentals and play your first songs in just 30 days!',
        skill: 'Piano',
        skillCategory: 'Music',
        creator: users[2]._id,
        price: 60,
        status: 'published',
        modules: [],
        enrolledUsers: [],
        queries: [],
      },
    ]);

    console.log(`✅ Created ${courses.length} courses`);

    // Create sample matches
    console.log('🔗 Creating sample matches...');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days
    
    const matches = await Match.insertMany([
      {
        teacher: users[0]._id, // Alice teaches JavaScript
        learner: users[2]._id, // Charlie learns JavaScript
        skill: 'JavaScript',
        skillCategory: 'Tech',
        matchScore: 85,
        reason: 'Perfect match! Alice is an expert in JavaScript and Charlie wants to learn it.',
        status: 'pending',
        expiresAt: expiresAt,
      },
      {
        teacher: users[1]._id, // Bob teaches Cooking
        learner: users[3]._id, // Diana learns Cooking
        skill: 'Cooking',
        skillCategory: 'Cooking',
        matchScore: 90,
        reason: 'Great match! Bob is an advanced cook and Diana is interested in learning.',
        status: 'pending',
        expiresAt: expiresAt,
      },
      {
        teacher: users[2]._id, // Charlie teaches Piano
        learner: users[0]._id, // Alice learns Piano
        skill: 'Piano',
        skillCategory: 'Music',
        matchScore: 88,
        reason: 'Excellent match! Charlie is a piano expert and Alice wants to learn.',
        status: 'accepted',
        expiresAt: expiresAt,
      },
    ]);

    console.log(`✅ Created ${matches.length} matches`);

    console.log('\n🎉 Seed data created successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    users.forEach((user) => {
      console.log(`\n👤 ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: password123`);
      console.log(`   Tokens: ${user.tokens} 🪙`);
      console.log(`   Reputation: ${user.reputation} ⭐`);
    });
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedData();
}

export default seedData;
