import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: 'match_new' | 'match_accepted' | 'match_rejected' | 'session_scheduled' | 'session_started' | 'session_ended' | 'token_transfer' | 'system';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { 
      type: String, 
      enum: ['match_new', 'match_accepted', 'match_rejected', 'session_scheduled', 'session_started', 'session_ended', 'token_transfer', 'system'],
      required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
