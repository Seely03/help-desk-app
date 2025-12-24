import mongoose, { Schema, Document } from 'mongoose';
import { CONSTANTS } from '../constants/primitives.js';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  jobTitle?: string; // Now restricted to specific strings
  team?: string;
  projects: mongoose.Types.ObjectId[];
  assignedTickets: mongoose.Types.ObjectId[];
}

const UserSchema: Schema = new Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    minlength: CONSTANTS.USERNAME.MIN,
    maxlength: CONSTANTS.USERNAME.MAX,
    match: CONSTANTS.REGEX.USERNAME
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: CONSTANTS.REGEX.AMAZON_EMAIL
  },
  password: { type: String, required: true },
  
  // System Privilege
  isAdmin: { type: Boolean, default: false },

  // Professional Role (Restricted Enum)
  jobTitle: { 
    type: String, 
    enum: CONSTANTS.ENUMS.JOB_TITLES, 
    default: 'Software Engineer' // Useful default, or remove to make it optional
  },

  // Team (Free text)
  team: { 
    type: String, 
    maxlength: CONSTANTS.JOB.TEAM_MAX,
    trim: true
  },

  projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  assignedTickets: [{ type: Schema.Types.ObjectId, ref: 'Ticket' }]

}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);