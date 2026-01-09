import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate extends Document {
  certificateId: string; // Unique verifiable ID
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  exam?: mongoose.Types.ObjectId;
  examScore?: number;
  skill: string;
  skillCategory: string;
  issuedAt: Date;
  issuedBy: mongoose.Types.ObjectId; // Course creator
  verified: boolean;
  metadata: {
    issueDate: Date;
    expiryDate?: Date;
    verificationUrl: string;
  };
}

const CertificateSchema = new Schema<ICertificate>(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
    },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    exam: { type: Schema.Types.ObjectId, ref: 'Exam' },
    examScore: Number,
    skill: { type: String, required: true },
    skillCategory: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now },
    issuedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    verified: { type: Boolean, default: true },
    metadata: {
      issueDate: { type: Date, default: Date.now },
      expiryDate: Date,
      verificationUrl: { type: String, required: true },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CertificateSchema.index({ certificateId: 1 });
CertificateSchema.index({ user: 1 });
CertificateSchema.index({ course: 1 });

export default mongoose.models.Certificate ||
  mongoose.model<ICertificate>('Certificate', CertificateSchema);
