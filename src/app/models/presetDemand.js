const mongoose = require("../../database");

const PresetDemandSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
       default: Date.now,
    },

});
const PresetDemand = mongoose.model('PresetDemand', PresetDemandSchema)

module.exports = PresetDemand;