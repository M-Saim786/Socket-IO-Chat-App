const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  chatRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'chatusers', required: true },
  message: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
