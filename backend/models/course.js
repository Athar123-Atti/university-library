const mongoose = require('mongoose');
const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }
});
module.exports = mongoose.model('Course', CourseSchema);
