import mongoose from 'mongoose';

const contributionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  examType: {
    type: String,
    required: true,
  },
  passoutYear: {
    type: Number,
    required: true,
    length: 4,
  },
  status: {
    type: String,
    enum: ['pending', 'verified'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Contribution', contributionSchema);
