const mongoose = require('mongoose');
const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  edition: String,
  isbn: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  pdf: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Book', BookSchema);
