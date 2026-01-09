import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  question: string;
  type: 'mcq' | 'short_answer';
  options?: string[]; // For MCQ
  correctAnswer: string | string[]; // string for short_answer, string[] for MCQ (multiple correct)
  points: number;
  explanation?: string;
}

export interface IExamAttempt {
  user: mongoose.Types.ObjectId;
  answers: {
    questionIndex: number;
    answer: string | string[];
    pointsEarned: number;
  }[];
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  submittedAt: Date;
  timeSpent: number; // in minutes
}

export interface IExam extends Document {
  course: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  questions: IQuestion[];
  passingScore: number; // percentage
  timeLimit: number; // in minutes
  maxAttempts: number;
  attempts: IExamAttempt[];
  randomized: boolean; // Whether to randomize question order
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  question: { type: String, required: true },
  type: {
    type: String,
    enum: ['mcq', 'short_answer'],
    required: true,
  },
  options: [String],
  correctAnswer: Schema.Types.Mixed, // Can be string or array
  points: { type: Number, required: true, default: 1 },
  explanation: String,
});

const ExamAttemptSchema = new Schema<IExamAttempt>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [
    {
      questionIndex: { type: Number, required: true },
      answer: Schema.Types.Mixed,
      pointsEarned: { type: Number, default: 0 },
    },
  ],
  score: { type: Number, required: true },
  totalPoints: { type: Number, required: true },
  percentage: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  submittedAt: { type: Date, default: Date.now },
  timeSpent: Number,
});

const ExamSchema = new Schema<IExam>(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: String,
    questions: [QuestionSchema],
    passingScore: { type: Number, default: 70, min: 0, max: 100 },
    timeLimit: { type: Number, default: 60 }, // minutes
    maxAttempts: { type: Number, default: 3 },
    attempts: [ExamAttemptSchema],
    randomized: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Indexes
ExamSchema.index({ course: 1 });
ExamSchema.index({ 'attempts.user': 1 });

export default mongoose.models.Exam || mongoose.model<IExam>('Exam', ExamSchema);
