const mongoose = require("../../database");

const bcrypt = require('bcryptjs')

const statuseschema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})
  
const Status = mongoose.model('Status', statuseschema)

module.exports = Status;