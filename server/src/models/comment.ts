import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  content: string;
  ticket: mongoose.Types.ObjectId; // Link to the Ticket
  author: mongoose.Types.ObjectId;
  isSystem: boolean; // Link to the User who wrote it
  createdAt: Date;
}

const CommentSchema: Schema = new Schema({
  content: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 1000 // Prevent massive spam
  },
  ticket: { 
    type: Schema.Types.ObjectId, 
    ref: 'Ticket', 
    required: true 
  },
  author: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  isSystem: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true }); // Automatically adds createdAt / updatedAt

export default mongoose.model<IComment>('Comment', CommentSchema);