const mongoose = require("../../database");


const SectorSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


const Sector = mongoose.model('Sector', SectorSchema)
module.exports = Sector;