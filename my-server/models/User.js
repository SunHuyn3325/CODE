const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({

  profileName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  gender: {
    type: String
  },

  birthDay: {
    type: Number
  },

  birthMonth: {
    type: Number
  },

  birthYear: {
    type: Number
  },

  marketing: {
    type: Boolean
  },
  phone: {
    type: String
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
    required: true
  },

})

module.exports = mongoose.model("User", UserSchema)