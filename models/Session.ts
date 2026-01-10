import mongoose, { Schema, Document } from 'mongoose';

export interface IAIMonitoringWindow {
  windowIndex: number;
  timestamp: Date;
  transcript?: string;
  speakerActivity?: {
    participant1: { speaking: boolean; cameraOn: boolean; silenceDuration?: number };
    participant2: { speaking: boolean; cameraOn: boolean; silenceDuration?: number };
  };
  interactionMetrics?: {
    teacherSpeakingTime?: number;
    learnerSpeakingTime?: number;
    questionCount?: number;
    hasTwoWayInteraction?: boolean;
  };
  engagement_score: number;
  teaching_score: number;
  participation_score: number;
  fraud_detected: boolean;
  notes?: string;
  aiAnalysis?: any;
}

export interface IMonitoringSnapshot {
  timestamp: Date;
  transcript?: string;
  speakerActivity: {
    teacher: { speaking: boolean; cameraOn: boolean };
    learner: { speaking: boolean; cameraOn: boolean };
  };
  engagement_score: number;
  teaching_score: number;
  participation_score: number;
  fraud_detected: boolean;
  notes?: string;
  aiAnalysis?: any;
}

export interface ISession extends Document {
  sessionId: string;
  dailyRoomUrl: string;
  dailyRoomName: string;
  teacher: mongoose.Types.ObjectId;
  learner: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  skill: string;
  skillCategory: string;
  status: 'created' | 'scheduled' | 'live' | 'under_review' | 'completed' | 'cancelled';
  readyStatus: {
    teacher: boolean;
    learner: boolean;
  };
  startTime?: Date;
  endTime?: Date;
  duration?: number; // in minutes
  monitoring_snapshots: IMonitoringSnapshot[];
  aiWindows: IAIMonitoringWindow[];
  final_engagement_score?: number;
  final_teaching_score?: number;
  final_participation_score?: number;
  fraud_flagged: boolean;
  tokenStatus: 'pending' | 'frozen' | 'distributed';
  tokens_transferred: boolean;
  tokens_amount?: number;
  review_status?: 'pending' | 'approved' | 'rejected';
  reviewed_by?: mongoose.Types.ObjectId;
  reviewed_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AIMonitoringWindowSchema = new Schema<IAIMonitoringWindow>({
  windowIndex: { type: Number, required: true },
  timestamp: { type: Date, required: true },
  transcript: String,
  speakerActivity: {
    participant1: {
      speaking: { type: Boolean, default: false },
      cameraOn: { type: Boolean, default: true },
      silenceDuration: Number,
    },
    participant2: {
      speaking: { type: Boolean, default: false },
      cameraOn: { type: Boolean, default: true },
      silenceDuration: Number,
    },
  },
  interactionMetrics: {
    teacherSpeakingTime: Number,
    learnerSpeakingTime: Number,
    questionCount: Number,
    hasTwoWayInteraction: Boolean,
  },
  engagement_score: { type: Number, min: 0, max: 100 },
  teaching_score: { type: Number, min: 0, max: 100 },
  participation_score: { type: Number, min: 0, max: 100 },
  fraud_detected: { type: Boolean, default: false },
  notes: String,
  aiAnalysis: Schema.Types.Mixed,
});

const MonitoringSnapshotSchema = new Schema<IMonitoringSnapshot>({
  timestamp: { type: Date, required: true },
  transcript: String,
  speakerActivity: {
    teacher: {
      speaking: { type: Boolean, default: false },
      cameraOn: { type: Boolean, default: true },
    },
    learner: {
      speaking: { type: Boolean, default: false },
      cameraOn: { type: Boolean, default: true },
    },
  },
  engagement_score: { type: Number, min: 0, max: 100 },
  teaching_score: { type: Number, min: 0, max: 100 },
  participation_score: { type: Number, min: 0, max: 100 },
  fraud_detected: { type: Boolean, default: false },
  notes: String,
  aiAnalysis: Schema.Types.Mixed,
});

const SessionSchema = new Schema<ISession>(
  {
    sessionId: { type: String, required: true, unique: true },
    dailyRoomUrl: { type: String, required: true },
    dailyRoomName: { type: String, required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    learner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    skill: { type: String, required: true },
    skillCategory: { type: String, required: true },
    status: {
      type: String,
      enum: ['created', 'scheduled', 'live', 'under_review', 'completed', 'cancelled'],
      default: 'created',
    },
    readyStatus: {
      teacher: { type: Boolean, default: false },
      learner: { type: Boolean, default: false },
    },
    startTime: Date,
    endTime: Date,
    duration: Number,
    monitoring_snapshots: [MonitoringSnapshotSchema],
    aiWindows: [AIMonitoringWindowSchema],
    final_engagement_score: { type: Number, min: 0, max: 100 },
    final_teaching_score: { type: Number, min: 0, max: 100 },
    final_participation_score: { type: Number, min: 0, max: 100 },
    fraud_flagged: { type: Boolean, default: false },
    tokenStatus: {
      type: String,
      enum: ['pending', 'frozen', 'distributed'],
      default: 'pending',
    },
    tokens_transferred: { type: Boolean, default: false },
    tokens_amount: Number,
    review_status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
    },
    reviewed_by: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewed_at: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
SessionSchema.index({ teacher: 1, status: 1 });
SessionSchema.index({ learner: 1, status: 1 });
SessionSchema.index({ createdAt: -1 });

export default mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
