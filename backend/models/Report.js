const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  weekDateRange: { type: String, required: true }, 
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  tasksCompleted: { type: String, required: true },
  tasksPlanned: { type: String, required: true },
  blockers: { type: String, required: true },
  hoursWorked: { type: Number },
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['late', 'pending', 'submitted'], 
    default: 'pending' 
  }
  ,submittedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);