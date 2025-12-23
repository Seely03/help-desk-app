import mongoose, { Schema, Document } from 'mongoose';
import { CONSTANTS } from '../constants/primitives.js';

export interface IProject extends Document {
  name: string;
  description?: string;
  members: mongoose.Types.ObjectId[];
}

const ProjectSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: true,
    maxlength: CONSTANTS.PROJECT.TITLE_MAX,
    match: CONSTANTS.REGEX.NO_HTML,
    trim: true
  },
  description: { 
    type: String,
    maxlength: CONSTANTS.PROJECT.DESC_MAX,
    match: CONSTANTS.REGEX.NO_HTML,
    trim: true 
  },
  
  // Who is on this project?
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }]

}, { timestamps: true });

export default mongoose.model<IProject>('Project', ProjectSchema);