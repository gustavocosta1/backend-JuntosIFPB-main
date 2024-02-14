const mongoose = require("../../database");
const bcrypt = require('bcryptjs');
const moment = require('moment');


const DemandSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true,
    },

    isAnonymous:{
        type: Boolean,
        required: true,
        default: false
    },

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },


    sector: {
        type: String,
        required: true
    },
    support: {
        type: Number,
        required: false,
        default: 1,
    },
    status: {
        type: String,
        required: true,
        default: "Não atribuído",
    },
    
    
    createdAt: {
        type: Date,
       default: Date.now,
    },
    supportUsers: [{
        type: String
    }],
    dateGMT: {
        type: String,
        default: moment(new Date(Date.now())).utcOffset('-0300').format('DD/MM/YYYY')
    }

});

const Demand = mongoose.model('Demand', DemandSchema)

module.exports = Demand;