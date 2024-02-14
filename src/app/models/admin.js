const mongoose = require("../../database");

const AdminSchema = new mongoose.Schema({
    adminId: {
        type: String,
        required: true,
        select: false,
    },
});

const Admin = mongoose.model('Admin', AdminSchema)

module.exports = Admin;