const request = require("supertest");
const User = require("../../models/user");
const Admin = require("../../models/admin")
const Demand = require("../../models/demand")
const bcrypt = require('bcryptjs');
const { default: mongoose } = require("mongoose");
const createApp = require("../../../createApp");
const express = require("express");
const generateToken = require("../../../generateToken");

describe("rankingController", () => {
    let app;

    beforeAll(async () => {
        app = createApp(express());

        const user = await User.create({ name: "anyname", email: "anyemail@gmail.com", password: "123456", isOutsourced: true, isVerified: true });
        
        await Demand.create({
            title: "title", 
            description: "description", 
            user: user.id, 
            sector:"Limpeza",
            isAnonymous: false, 
            supportUsers: user.id, 
            status: "Atribuído"});

        await Demand.create({
            title: "title2", 
            description: "description2", 
            user: user.id, 
            sector:"Manutenção",
            isAnonymous: false, 
            supportUsers: user.id, 
            status: "Em Análise"});
        
        await Demand.create({
            title: "demanda 2", 
            description: "description2", 
            user: user.id, 
            sector:"Manutenção",
            isAnonymous: false, 
            supportUsers: user.id, 
            status: "Em Análise"});
    })

    afterAll(async () => { await mongoose.disconnect() });

    it("should get all elements from ranking", async () => {
        
        
        const res = await request(app).get("/ranking/").send({ })
        
        expect(res.statusCode).toEqual(200)
    })

    it("should get a specific sector", async () => {
    
        const res = await request(app).get("/ranking/findSectorOrder").query({ "sector": "Limpeza" })
        
        expect(res.statusCode).toEqual(200)
    })

    it("should get filtered by most recent", async () => {
    
        const res = await request(app).get("/ranking/findSectorOrder").query({ "sector": "Recentes" })
        
        expect(res.statusCode).toEqual(200)
    })

    it("should get filtered by oldest", async () => {
    
        const res = await request(app).get("/ranking/findSectorOrder").query({ "sector": "Antigos" })
        
        expect(res.statusCode).toEqual(200)
    })

    it("should get a query of demands", async () => {
    
        const res = await request(app).get("/ranking/search").query({ "querySearch": "dem" })
        
        expect(res.statusCode).toEqual(200)
    })

    /* it("should get a demand", async () => {
    
        const res = await request(app).get("/ranking/:demandId").params
        console.log(res)
        expect(res.statusCode).toEqual(200)
    }) */
    
    
})