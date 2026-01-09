import mongoose, { Schema, Document } from 'mongoose';
import { CONSTANTS } from '../constants/Primitives.js';

export interface ITicket extends Document {
  title: string;
  description?: string;
  priority: string;
  status: string;
  sizing: number;
  assignedTo?: mongoose.Types.ObjectId; // Optional: Ticket might be unassigned
  project: mongoose.Types.ObjectId;     // Required: Must belong to a project
}

const TicketSchema: Schema = new Schema({
  title: { 
    type: String, 
    required: true,
    maxlength: CONSTANTS.TICKET.TITLE_MAX,
    match: CONSTANTS.REGEX.NO_HTML,
    trim: true
  },
  description: { 
    type: String,
    maxlength: CONSTANTS.TICKET.DESC_MAX,
    match: CONSTANTS.REGEX.NO_HTML,
    trim: true
  },
  
  // Enums for standardizing workflow
  priority: { 
    type: String, 
    enum: CONSTANTS.ENUMS.PRIORITY, 
    default: 'Medium' 
  },
  status: {
    type: String,
    enum: CONSTANTS.ENUMS.STATUS,
    default: 'Open'
  },
  sizing: { 
    type: Number, 
    default: 1,
    enum: [1, 2, 3, 5, 8, 13, 21] 
  },

  // Relationships
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  
  // The 'Strict' relationship (A ticket must have a project)
  project: { 
    type: Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  }

}, { timestamps: true });

export default mongoose.model<ITicket>('Ticket', TicketSchema);