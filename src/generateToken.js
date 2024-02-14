const express = require("express")
const authConfig = require('./config/auth.json')
const jwt = require("jsonwebtoken")

require('dotenv').config();

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    })
}

module.exports = generateToken;