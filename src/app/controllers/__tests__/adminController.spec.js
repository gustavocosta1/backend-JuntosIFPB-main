const request = require("supertest");
const User = require("../../models/user");
const Admin = require("../../models/admin")
const bcrypt = require('bcryptjs');
const { default: mongoose } = require("mongoose");
const createApp = require("../../../createApp");
const express = require("express");
const generateToken = require("../../../generateToken");


describe("adminController", () => {
    let app;
    beforeAll(async () => {
        app = createApp(express());
    })
    beforeEach(async () => { await User.deleteMany() });

    afterAll(async () => { await mongoose.disconnect() });
    it("verify if user is admin", async () => {


        const user = await User.create({ name: "anyname", email: "anyemail@gmail.com", password: "123456", isOutsourced: true, isVerified: true });
        const token = generateToken({ params: user.id });
        const res = await request(app).post("/admin/sector").set({ "Authorization": `Bearer ${token}`}).send({ title: "anytitle", email: "anyemail@gmail.com" })
        expect(res.statusCode).toEqual(400)        

        //console.log(await User.findOne({ email: user.email }))
    })

    it("admin should create new sector", async () => {        
        const user = await User.create({name: "alisson",email: "alissonlucena100@gmail.com",password: "123456",isVerified: "true"})
        const token = generateToken({ params: user.id });
        await request(app).post("/auth/authenticate").send({email: "alissonlucena100@gmail.com", password: "123456"})
        
        const res = await request(app).post("/admin/sector").set({ "Authorization": `Bearer ${token}`}).send({ title: "anytitle", email: "anyemail@gmail.com",})
        expect(res.statusCode).toEqual(200)    
    })

    it("admin should create new sector 2", async () => {
        const token = generateToken({ params: "627db0618a3cb4aaf72d382b" });
        const adminId = await Admin.findOne({ adminId: "627db0618a3cb4aaf72d382b" })
        /* expect(adminId).toBe(true) */
        /* const res = await request(app).post("/admin/sector").set({ "Authorization": `Bearer ${token}`}).send({ title: "anytitle", email: "anyemail@gmail.com" }) */
        /* console.log(res.userId)
        expect(res.statusCode).toEqual(200) */
    })
})