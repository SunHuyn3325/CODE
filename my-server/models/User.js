const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const BCRYPT_SALT_ROUNDS = 10

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

  passwordResetTokenHash: {
    type: String,
    default: null
  },

  passwordResetExpiresAt: {
    type: Date,
    default: null
  },

})

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, BCRYPT_SALT_ROUNDS);
})

UserSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate() || {}
  const directPassword = update.password
  const setPassword = update.$set?.password
  const incomingPassword = directPassword || setPassword

  if (!incomingPassword) return;

  const hashedPassword = await bcrypt.hash(incomingPassword, BCRYPT_SALT_ROUNDS)

  if (setPassword) {
    update.$set.password = hashedPassword
  } else {
    update.password = hashedPassword
  }

  this.setUpdate(update)
})

module.exports = mongoose.model("User", UserSchema)