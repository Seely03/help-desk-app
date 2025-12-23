import mongoose, { Document, Schema } from 'mongoose';

// 1. Update the Interface
export interface ITicket extends Document {
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'In Review' | 'Closed'; // Added 'In Review'
  priority: 'Low' | 'Medium' | 'High';
  sizing: 1 | 2 | 3 | 5 | 8 | 13 | 21; // Added Fibonacci types
  userEmail: string;
  createdAt: Date;
}

// 2. Update the Schema
const TicketSchema: Schema = new Schema({
  title: { 
    type: String, 
    required: [true, 'Please add a title'], 
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'] 
  },
  description: { 
    type: String, 
    required: [true, 'Please add a description'] 
  },
  status: { 
    type: String, 
    // The enum strictly limits values to this list
    enum: ['Open', 'In Progress', 'In Review', 'Closed'], 
    default: 'Open' 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Low' 
  },
  // New Sizing Field
  sizing: {
    type: Number,
    // Validate that the number is a valid Fibonacci estimate
    enum: [1, 2, 3, 5, 8, 13, 21],
    default: 1
  },
  userEmail: {
    type: String,
    required: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model<ITicket>('Ticket', TicketSchema);