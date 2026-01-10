import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill {
  name: string;
  category: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verified: boolean;
  verifiedAt?: Date;
  xp: number;
}

export interface IProgressTracker {
  skill: string;
  coursesCompleted: number;
  sessionsAttended: number;
  xpEarned: number;
  lastActive: Date;
  streak: number;
  badges: string[];
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  bio?: string;
  skills_known: ISkill[];
  skills_learning: ISkill[];
  courses_created: mongoose.Types.ObjectId[];
  progress_tracker: IProgressTracker[];
  tokens: number;
  reputation: number;
  refreshTokens: string[];
  loginAttempts: number;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const SkillSchema = new Schema<ISkill>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  proficiency: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner',
  },
  verified: { type: Boolean, default: false },
  verifiedAt: Date,
  xp: { type: Number, default: 0 },
});

const ProgressTrackerSchema = new Schema<IProgressTracker>({
  skill: { type: String, required: true },
  coursesCompleted: { type: Number, default: 0 },
  sessionsAttended: { type: Number, default: 0 },
  xpEarned: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  streak: { type: Number, default: 0 },
  badges: [{ type: String }],
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    bio: { type: String, maxlength: 500 },
    skills_known: [SkillSchema],
    skills_learning: [SkillSchema],
    courses_created: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    progress_tracker: [ProgressTrackerSchema],
    tokens: { type: Number, default: 100 }, // Starting tokens
    reputation: { type: Number, default: 0 },
    refreshTokens: [{ type: String }],
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ 'skills_known.name': 1 });
UserSchema.index({ 'skills_learning.name': 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
