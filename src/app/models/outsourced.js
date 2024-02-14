const mongoose = require("../../database");
const bcrypt = require('bcryptjs')

const OutsourcedSchema = new mongoose.Schema({
    cpf: {
      type: String,

    },
    email: {
        type: String,
        required: false,
        unique: true,
        lowercase: true
    },
    
    createdAt: {
        type: Date,
        default: Date.now,
    },

    sector: {
        type: String,
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
    },

    isAuthenticated:{
        type: Boolean,
        required: true,
        default: false
    },

});

OutsourcedSchema.pre('save', async function(next){
    const hash = await bcrypt.hash(this.cpf,10);
    this.cpf = hash;
    next();
});

const Outsourced = mongoose.model('Outsourced', OutsourcedSchema)

module.exports = Outsourced;