const mongoose = require("mongoose")

const FeedbackSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  message: String
})

module.exports = mongoose.model("Feedback", FeedbackSchema)