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

})

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next()
  }

  try {
    this.password = await bcrypt.hash(this.password, BCRYPT_SALT_ROUNDS)
    next()
  } catch (error) {
    next(error)
  }
})

UserSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() || {}
  const directPassword = update.password
  const setPassword = update.$set?.password
  const incomingPassword = directPassword || setPassword

  if (!incomingPassword) {
    return next()
  }

  try {
    const hashedPassword = await bcrypt.hash(incomingPassword, BCRYPT_SALT_ROUNDS)

    if (setPassword) {
      update.$set.password = hashedPassword
    } else {
      update.password = hashedPassword
    }

    this.setUpdate(update)
    next()
  } catch (error) {
    next(error)
  }
})

module.exports = mongoose.model("User", UserSchema)