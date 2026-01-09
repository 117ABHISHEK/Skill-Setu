import mongoose, { Schema, Document } from 'mongoose';

export interface ILesson {
  title: string;
  description?: string;
  order: number;
  content: {
    type: 'video' | 'text' | 'pdf' | 'link';
    url?: string;
    text?: string;
    externalLink?: string;
  };
  duration?: number; // in minutes
}

export interface IModule {
  title: string;
  description?: string;
  order: number;
  lessons: ILesson[];
}

export interface IQuery {
  _id?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  question: string;
  answer?: string;
  answeredBy?: mongoose.Types.ObjectId;
  answeredAt?: Date;
  pinned: boolean;
  upvotes: mongoose.Types.ObjectId[];
  createdAt: Date;
}

export interface ICourse extends Document {
  title: string;
  description: string;
  skill: string;
  skillCategory: string;
  creator: mongoose.Types.ObjectId;
  modules: IModule[];
  thumbnail?: string;
  enrolledUsers: mongoose.Types.ObjectId[];
  completionCount: number;
  rating: number;
  ratingCount: number;
  price: number; // in tokens
  hasExam: boolean;
  exam?: mongoose.Types.ObjectId;
  queries: IQuery[];
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>({
  title: { type: String, required: true },
  description: String,
  order: { type: Number, required: true },
  content: {
    type: {
      type: String,
      enum: ['video', 'text', 'pdf', 'link'],
      required: true,
    },
    url: String,
    text: String,
    externalLink: String,
  },
  duration: Number,
});

const ModuleSchema = new Schema<IModule>({
  title: { type: String, required: true },
  description: String,
  order: { type: Number, required: true },
  lessons: [LessonSchema],
});

const QuerySchema = new Schema<IQuery>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: String, required: true },
    answer: String,
    answeredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    answeredAt: Date,
    pinned: { type: Boolean, default: false },
    upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    skill: { type: String, required: true },
    skillCategory: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    modules: [ModuleSchema],
    thumbnail: String,
    enrolledUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    completionCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    hasExam: { type: Boolean, default: false },
    exam: { type: Schema.Types.ObjectId, ref: 'Exam' },
    queries: [QuerySchema],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CourseSchema.index({ creator: 1 });
CourseSchema.index({ skill: 1, skillCategory: 1 });
CourseSchema.index({ status: 1 });
CourseSchema.index({ rating: -1 });

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
