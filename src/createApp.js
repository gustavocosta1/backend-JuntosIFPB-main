const contato = require("./routes/contact")
const cors = require("cors")
const bodyParser = require('body-parser')
const express = require("express");
const rankingController = require('./app/controllers/rankingController')

const authController = require('./app/controllers/authController')
const demandController = require( './app/controllers/demandController')
const outsourcedController = require( './app/controllers/outsourcedController')
const adminController = require( './app/controllers/adminController')
const sectorController = require( './app/controllers/sectorController')
const presetDemandController = require( './app/controllers/presetDemandController')
const statusController = require( './app/controllers/statusController')
const validateCpfController = require( './app/controllers/validateCpfController')

const createApp = (app) => {
    app.use(express.json());
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())
    app.use(cors())
    app.use("/api", contato)
    app.use("/auth", authController)
    app.use("/demands", demandController)
    app.use("/ranking", rankingController)
    app.use("/outsourced", outsourcedController)
    app.use("/admin", adminController)
    app.use("/sector", sectorController)
    app.use("/presetDemand", presetDemandController)
    app.use("/status", statusController)
    app.use("/validateCpf", validateCpfController)
    return app;
}

module.exports = createApp;