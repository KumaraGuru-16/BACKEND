import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
  recordId: { 
    type: String, 
    required: true, 
    index: true 
    // This ID stays the same across all versions of the same record
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  version: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// Composite index to ensure we don't have duplicate versions for the same record ID
recordSchema.index({ recordId: 1, version: 1 }, { unique: true });

export default mongoose.model('Record', recordSchema);