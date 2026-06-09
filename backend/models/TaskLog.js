import mongoose from 'mongoose';

const taskLogSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  notes: {
    type: String,
  },
  imageUrls: [{
    type: String,
  }],
  remarks: {
    type: String,
  },
  visibility: {
    type: String,
    enum: ['Public', 'Group', 'Private'],
    default: 'Group',
  }
}, { timestamps: true });

taskLogSchema.index({ taskId: 1 });
taskLogSchema.index({ userId: 1 });

const TaskLog = mongoose.model('TaskLog', taskLogSchema);
export default TaskLog;
