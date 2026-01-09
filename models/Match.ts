import mongoose, { Schema, Document } from 'mongoose';

export interface IMatch extends Document {
  learner: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  skill: string;
  skillCategory: string;
  matchScore: number;
  reason: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
  {
    learner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    skill: { type: String, required: true },
    skillCategory: { type: String, required: true },
    matchScore: { type: Number, required: true, min: 0, max: 100 },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending',
    },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

// Indexes
MatchSchema.index({ learner: 1, status: 1 });
MatchSchema.index({ teacher: 1, status: 1 });
MatchSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);
