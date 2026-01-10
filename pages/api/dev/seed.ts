/**
 * Development Seed Data API Route
 * POST /api/dev/seed - Populates database with test data
 * Only works in development mode
 */

import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Course from '@/models/Course';
import Match from '@/models/Match';
import Session from '@/models/Session';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Seed endpoint disabled in production' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    console.log('🗄️ Connected to MongoDB');

    // Clear existing data
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
      {
        name: 'Elena Gilbert',
        email: 'elena@example.com',
        password: hashedPassword,
        bio: 'Language enthusiast and dance lover.',
        skills_known: [
          { name: 'French', category: 'Languages', proficiency: 'expert', verified: true, xp: 500 },
          { name: 'Salsa', category: 'Dance', proficiency: 'advanced', verified: true, xp: 400 },
          { name: 'Creative Writing', category: 'Creative', proficiency: 'advanced', verified: true, xp: 350 },
        ],
        skills_learning: [
          { name: 'Spanish', category: 'Languages', proficiency: 'beginner', verified: false, xp: 50 },
          { name: 'Cooking', category: 'Cooking', proficiency: 'beginner', verified: false, xp: 20 },
        ],
        tokens: 160,
        reputation: 82,
        progress_tracker: [],
      },
      {
        name: 'Frank Castle',
        email: 'frank@example.com',
        password: hashedPassword,
        bio: 'Fitness expert and practical skills teacher.',
        skills_known: [
          { name: 'Fitness Training', category: 'Practical', proficiency: 'expert', verified: true, xp: 600 },
          { name: 'Self Defense', category: 'Practical', proficiency: 'expert', verified: true, xp: 550 },
          { name: 'Strategy', category: 'Soft Skills', proficiency: 'expert', verified: true, xp: 500 },
        ],
        skills_learning: [
          { name: 'Public Speaking', category: 'Soft Skills', proficiency: 'beginner', verified: false, xp: 60 },
          { name: 'Chess', category: 'Gaming', proficiency: 'beginner', verified: false, xp: 30 },
        ],
        tokens: 140,
        reputation: 90,
        progress_tracker: [],
      },
      {
        name: 'Grace Hopper',
        email: 'grace@example.com',
        password: hashedPassword,
        bio: 'Computer scientist and math lover.',
        skills_known: [
          { name: 'COBOL', category: 'Tech', proficiency: 'expert', verified: true, xp: 800 },
          { name: 'Compilers', category: 'Tech', proficiency: 'expert', verified: true, xp: 750 },
          { name: 'Mathematics', category: 'Tech', proficiency: 'expert', verified: true, xp: 700 },
        ],
        skills_learning: [
          { name: 'React', category: 'Tech', proficiency: 'beginner', verified: false, xp: 50 },
          { name: 'JavaScript', category: 'Tech', proficiency: 'beginner', verified: false, xp: 40 },
        ],
        tokens: 250,
        reputation: 98,
        progress_tracker: [],
      },
      {
        name: 'Harry Potter',
        email: 'harry@example.com',
        password: hashedPassword,
        bio: 'Magic and strategy enthusiast.',
        skills_known: [
          { name: 'Defense Against Dark Arts', category: 'Practical', proficiency: 'expert', verified: true, xp: 700 },
          { name: 'Broomstick Flying', category: 'Practical', proficiency: 'advanced', verified: true, xp: 500 },
          { name: 'Public Speaking', category: 'Soft Skills', proficiency: 'intermediate', verified: true, xp: 300 },
        ],
        skills_learning: [
          { name: 'Mathematics', category: 'Tech', proficiency: 'beginner', verified: false, xp: 10 },
          { name: 'Cooking', category: 'Cooking', proficiency: 'beginner', verified: false, xp: 15 },
        ],
        tokens: 130,
        reputation: 88,
        progress_tracker: [],
      },
      {
        name: 'Iris West',
        email: 'iris@example.com',
        password: hashedPassword,
        bio: 'Journalist and communications expert.',
        skills_known: [
          { name: 'Journalism', category: 'Soft Skills', proficiency: 'expert', verified: true, xp: 600 },
          { name: 'Public Relations', category: 'Soft Skills', proficiency: 'advanced', verified: true, xp: 450 },
          { name: 'Photography', category: 'Practical', proficiency: 'advanced', verified: true, xp: 400 },
        ],
        skills_learning: [
          { name: 'Spanish', category: 'Languages', proficiency: 'beginner', verified: false, xp: 40 },
          { name: 'Self Defense', category: 'Practical', proficiency: 'beginner', verified: false, xp: 20 },
        ],
        tokens: 170,
        reputation: 86,
        progress_tracker: [],
      },
      {
        name: 'Jack Sparrow',
        email: 'jack@example.com',
        password: hashedPassword,
        bio: 'Sailing and negotiation expert.',
        skills_known: [
          { name: 'Sailing', category: 'Practical', proficiency: 'expert', verified: true, xp: 750 },
          { name: 'Negotiation', category: 'Soft Skills', proficiency: 'expert', verified: true, xp: 700 },
          { name: 'Sword Fighting', category: 'Practical', proficiency: 'expert', verified: true, xp: 650 },
        ],
        skills_learning: [
          { name: 'Ethics', category: 'Soft Skills', proficiency: 'beginner', verified: false, xp: 5 },
          { name: 'French', category: 'Languages', proficiency: 'beginner', verified: false, xp: 10 },
        ],
        tokens: 110,
        reputation: 70,
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
        title: 'Salsa for Everyone',
        description: 'Learn the basics of Salsa dancing in this fun and interactive course.',
        skill: 'Salsa',
        skillCategory: 'Dance',
        creator: users[4]._id,
        price: 30,
        status: 'published',
        modules: [],
        enrolledUsers: [],
        queries: [],
      },
      {
        title: 'Mastering Negotiation',
        description: 'The art of closing deals and winning negotiations.',
        skill: 'Negotiation',
        skillCategory: 'Soft Skills',
        creator: users[9]._id,
        price: 70,
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
        teacher: users[4]._id, // Elena teaches French
        learner: users[0]._id, // Alice learns French
        skill: 'French',
        skillCategory: 'Languages',
        matchScore: 95,
        reason: 'Excellent match! Elena is a French expert and Alice is a dedicated learner.',
        status: 'accepted',
        expiresAt: expiresAt,
      },
      {
        teacher: users[6]._id, // Grace teaches React (learning but expert in tech)
        // Wait, Grace knows COBOL, Mathematics, Compilers. She is learning React.
        // Let's make users[3] (Diana) teach React to users[1] (Bob)
        learner: users[1]._id,
        skill: 'React',
        skillCategory: 'Tech',
        matchScore: 88,
        reason: 'Diana is an expert in React and Bob is a beginner.',
        status: 'accepted',
        expiresAt: expiresAt,
      },
    ]);

    console.log(`✅ Created ${matches.length} matches`);

    // Create sample sessions
    console.log('🎥 Creating sample sessions...');
    const sessions = await Session.insertMany([
      {
        sessionId: 'session-seed-1',
        dailyRoomUrl: 'https://meet.jit.si/SkillSetu-session-seed-1',
        dailyRoomName: 'SkillSetu-session-seed-1',
        teacher: users[4]._id,
        learner: users[0]._id,
        participants: [users[4]._id, users[0]._id],
        skill: 'French',
        skillCategory: 'Languages',
        status: 'live',
        startTime: new Date(),
        readyStatus: { teacher: true, learner: true }
      },
      {
        sessionId: 'session-seed-2',
        dailyRoomUrl: 'https://meet.jit.si/SkillSetu-session-seed-2',
        dailyRoomName: 'SkillSetu-session-seed-2',
        teacher: users[3]._id,
        learner: users[1]._id,
        participants: [users[3]._id, users[1]._id],
        skill: 'React',
        skillCategory: 'Tech',
        status: 'completed',
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(),
        readyStatus: { teacher: true, learner: true }
      }
    ]);

    res.status(200).json({
      message: 'Seed data created successfully!',
      data: {
        users: users.length,
        courses: courses.length,
        matches: matches.length,
        sessions: sessions.length
      },
      credentials: users.map((user) => ({
        name: user.name,
        email: user.email,
        password: 'password123',
        tokens: user.tokens,
        reputation: user.reputation,
      })),
    });
  } catch (error: any) {
    console.error('❌ Error seeding data:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
