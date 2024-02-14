const express = require("express")
const User = require("../models/user")
const Demand = require("../models/demand")
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const authConfig = require('../../config/auth.json')
const crypto = require('crypto')
const mailer = require('../../modules/mailer');
const authMiddleware = require('../middlewares/auth')
const nodemailer = require('nodemailer');
const Outsourced = require("../models/outsourced")
const router = express.Router()
require('dotenv').config();

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    })
}

function convertStringToHex(str) {
    const arr1 = [];
    for (let n = 0, l = str.length; n < l; n++) {
        const hex = Number(str.charCodeAt(n)).toString(16);
        arr1.push(hex);
    }
    return arr1.join('');
}

const isServer = async (cpf, emailTec) => {
    if (cpf.length === 14) {
        const user = await (Outsourced.find())
        for (let i = 0; i < user.length; i++) {
            if (await bcrypt.compare(cpf, user[i].cpf)) {
                return true
            }
        }
        
        return false;
        
    }
    else {
        const userValid = await Outsourced.findOne({ email: emailTec })
        if (userValid) {
            return true;
        }
        else {
            return false;
        }
    }
}

const tecVerify = async(email) => {
    
    const user = await (Outsourced.findOne({ email: email }))
    
    if (user) {
        
        return true
    }
    else {
        //console.log("Não é um tecnico")
        return false
    }
}

router.get("/account/:userId", async (req, res) => {
    try {
        const userDemands = await Demand.find({ user: req.params.userId });
        res.send(userDemands);
    } catch (err) {
        return res.status(400).send({ error: 'Busca invalida' });
    }
});

router.get("/me/:userId", async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.userId }).select('id');
        res.send(user.id);
    } catch (err) {
        return res.status(400).send({ error: 'Usuario nao existe' });
    }
});

router.put("/DataModify/:userId", async (req, res) => {
    const { name, password } = req.body;
    const user = await User.findOne({ _id: req.params.userId }).select('+password id email');
    try {
        if (!await bcrypt.compare(password, user.password)) {
            return res.status(400).send({ error: 'Senha invalida' })
        }

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                name: name
            }
        })
        let transporter = nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            auth: {
                user: "apikey",
                pass: process.env.SENDGRID_API_KEY
            }
        })
        transporter.sendMail({
            from: 'juntosifpb@gmail.com',
            to: user.email,
            subject: 'Alteração de usuário',
            text: `Olá! Você alterou seu nome de usuário para uso no sistema Juntos pelo IFPB.`
        });

        return res.status(200).send({ status: 'Ok' });
    } catch (err) {
        return res.status(400).send('Falha ao modificar.');
    }
});
router.put("/PasswordModify/:userId", async (req, res) => {
    const { currentPassword, password, confirmPassword } = req.body;
    const user = await User.findById(req.params.userId).select('+password');
    try {
        if (!await bcrypt.compare(currentPassword, user.password)) {
            return res.status(400).send({ error: 'Senha invalida' })
        }

        if (password !== confirmPassword) {
            return res.status(400).send({ error: 'Senha nao confere' })
        }
        user.password = password;
        await user.save();
        let transporter = nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            auth: {
                user: "apikey",
                pass: process.env.SENDGRID_API_KEY
            }
        })
        transporter.sendMail({
            from: 'juntosifpb@gmail.com',
            to: user.email,
            subject: 'Alteração de senha',
            text: `Olá! Você alterou a sua senha para uso no sistema Juntos pelo IFPB.`
        });
        return res.status(200).send({ status: 'Ok' });
    } catch (err) {

        return res.status(400).send('Falha ao modificar.');
    }
});

const emailValidation = async (emailDataValidation, cpf = null) => {
    try {

        const user = await (Outsourced.find())

        if (emailDataValidation.includes('@')) {

            if (emailDataValidation.split('@')[1] === "academico.ifpb.edu.br" || emailDataValidation.split('@')[1] === "ifpb.edu.br") {

                return true
            }

            // se é terceirizado
            for (let i = 0; i < user.length; i++) {
                if (await bcrypt.compare(cpf, user[i].cpf)) {

                    if (user[i].isAuthenticated) {

                        return false
                    }

                    return user[i].id
                }
            }

            return false
        }

    }

    catch (e) {
        /* return res.status(400).send({error: "Email fora do dominio"}) */
        return false
    }
}

const dicDocValidation = async (emailDataValidation) => {
    try {
        if (emailDataValidation.includes('@')) {

            if (emailDataValidation.split('@')[1] === "academico.ifpb.edu.br" || emailDataValidation.split('@')[1] === "ifpb.edu.br") {

                return true
            }
    }
    else{
        return false
    }
}
    catch (e) {
        return false
    }
}




router.post("/register", async (req, res) => {

    const { email, cpf, isTec } = req.body;
    const cpfValue = {cpf: ""};
    let outId = "";
    
    try {
        
        if(cpf !== null){
            cpfValue.cpf = cpf;
        }
        if (await User.findOne({ email }))
            return res.status(400).send({ error: 'Usuário já existe' })

        const outsourcedId = await emailValidation(email, cpfValue.cpf)
        const server = await isServer(cpfValue.cpf, email)
        
        if (outsourcedId === false && server) {

            return res.status(400).send({ error: 'Email não é válido' })
        }

        if (!server){
            if(outsourcedId === false){
                return res.status(400).send({ error: 'Usuário não é válido' })
            }
            if(!(await dicDocValidation(email))){
                return res.status(400).send({ error: 'Email não é válido' })
            }
        }

        
        if( isTec){
            
            if( !(await tecVerify(email)) ){
                
                return res.status(400).send({ error: 'Téc Adm não cadastrado' })
            }
            
        }
        const user = await User.create({ name: req.body.name, email: req.body.email, password: req.body.password, isOutsourced: server });


        user.password = undefined;
        
        
        const token = crypto.randomBytes(20).toString('hex');
        const now = new Date();
        now.setHours(now.getHours() + 1);
        
        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        });
        
        
        if (user.isOutsourced && cpfValue.cpf.length === 14) {
            
            
            const outsourced = await Outsourced.find();

            for (let i = 0; i < outsourced.length; i++) {
                
                if (await bcrypt.compare(cpfValue.cpf, outsourced[i].cpf)) {

                    outsourced[i].userId = user.id;
                    await outsourced[i].save();
                    outId = user.id

                    /* await Outsourced.findOne(outsourced[i].id,{
                        '$set':{
                            userId: user.id
                        }
                    }); */
                }
            }
            
        }
        
        else if (user.isOutsourced) {
            
            const outUser = await Outsourced.findOne({ email: req.body.email })
            outId = outUser.id
            outUser.userId = user.id
            await outUser.save()
            
        }
        
        
        if (!server) {
            

            emailText = `Olá! Você solicitou um registro neste email para o sistema Juntos pelo IFPB. 
            Para verificar sua conta, clique no link a seguir: https://juntosifpb.netlify.app/login/token=${token.toString()}`
            
        }
        else {
            
            emailText = `Olá! Você solicitou um registro neste email para o sistema Juntos pelo IFPB. 
            Para verificar sua conta, clique no link a seguir: https://juntosifpb.netlify.app/login/token=${token.toString()}=${outId.toString()}`
            
        }

        
        let transporter = nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            auth: {
                user: "apikey",
                pass: process.env.SENDGRID_API_KEY
            }
        })
        
        transporter.sendMail({
            from: 'juntosifpb@gmail.com',
            to: email,
            subject: 'Registro de usuário',
            text: emailText
        });
        
        return res.send({ user, token: generateToken({ id: user.id }) })
    }
    catch (err) {
        
        return res.status(400).send({ error: 'Falha ao registrar' })
    }
});

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +passwordResetToken passwordResetExpires isVerified isOutsourced')

    if (!user)
        return res.status(400).send({ error: 'Usuário não encontrado' })

    if (!await bcrypt.compare(password, user.password))
        return res.status(400).send({ error: 'Senha inválida' })

    if (user.isVerified) {
        return res.send({ user, token: generateToken({ id: user.id }) });
    }

    if (req.body.token && req.body.token !== undefined) {

        if (req.body.token !== user.passwordResetToken)
            return res.status(400).send({ error: 'Token invalido' });
        if (this.now > user.passwordResetExpires)
            return res.status(400).send({ error: 'O token expirou, gere um novo' });

        else if (req.body.outsourcedId || req.body.outsourcedId === undefined) {

            await User.findByIdAndUpdate(user.id, {
                '$set': {
                    isVerified: true,
                }
            })
            
            if (req.body.outsourcedId) {
                
                await Outsourced.findByIdAndUpdate(req.body.outsourcedId, {
                    '$set': {
                        isAuthenticated: true,
                    }
                })
                
            }

            user.password = undefined
            return res.send({ user, token: generateToken({ id: user.id }) });
        }

    }

    if (!user.isVerified) {
        return res.status(400).send({ error: 'O usuário ainda não foi verificado' })
    }
})

router.post('/forgot_password', async (req, res) => {

    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user)
            return res.status(400).send({ error: 'Usuário não encontrado' })

        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        });



        let transporter = nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            auth: {
                user: "apikey",
                pass: process.env.SENDGRID_API_KEY
            }
        })
        transporter.sendMail({
            from: 'juntosifpb@gmail.com',
            to: email,
            subject: 'Recuperação de email',
            text: `Olá! Você cadastrou este email como endereço de recuperação de senha para uso no sistema Juntos pelo IFPB. Para confirmar clique no link a seguir: https://juntosifpb.netlify.app/resetar_senha/token=${token.toString()}=${convertStringToHex(email)}`


        });

        return res.status(200).send({ status: 'ok' })


    } catch (err) {
        res.status(400).send({ erro: "Erro ao esquecer a senha, tente novamente" })
    }
});

router.post('/reset_password', async (req, res) => {
    const { email, token, password } = req.body;


    try {
        const user = await User.findOne({ email }).select('+passwordResetToken passwordResetExpires');



        if (!user)
            return res.status(400).send({ error: 'Usuário não encontrado' });

        if (token !== user.passwordResetToken)
            res.status(400).send({ error: 'Token invalido' });

        if (this.now > user.passwordResetExpires)
            return res.status(400).send({ error: 'O token expirou, gere um novo' });


        user.password = password;

        await user.save();


        let transporter = nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            auth: {
                user: "apikey",
                pass: process.env.SENDGRID_API_KEY
            }
        })
        transporter.sendMail({
            from: 'juntosifpb@gmail.com',
            to: email,
            subject: 'Recuperação de senha',
            text: `Olá! Você recuperou a senha da sua conta para uso no sistema Juntos pelo IFPB.`


        });

        res.status(200).send({ status: 'Ok' });

    } catch (err) {
        res.status(400).send({ error: 'Não é possível redefinir a senha, tente novamente' });
    }
});

router.put("/DataModify/:userId", async (req, res) => {
    const { name, password } = req.body;
    const user = await User.findOne({ _id: req.params.userId }).select('+password id email');
    try {
        if (!await bcrypt.compare(password, user.password)) {
            return res.status(400).send({ error: 'Senha invalida' })
        }

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                name: name
            }
        })
        let transporter = nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            auth: {
                user: "apikey",
                pass: process.env.SENDGRID_API_KEY
            }
        })
        transporter.sendMail({
            from: 'juntosifpb@gmail.com',
            to: user.email,
            subject: 'Alteração de usuário',
            text: `Olá! Você alterou seu nome de usuário para uso no sistema Juntos pelo IFPB.`
        });

        return res.status(200).send({ status: 'Ok' });
    } catch (err) {
        return res.status(400).send('Falha ao modificar.');
    }
});

router.delete("/deleteAccount/:userId", async (req, res) => {
    const { password } = req.body;
    const user = await User.findOne({ _id: req.params.userId }).select('+password id email');
    try {
        if (!await bcrypt.compare(password, user.password)) {
            return res.status(400).send({ error: 'Senha invalida' })
        }
        const userRemove = await User.findByIdAndRemove({ _id: req.params.userId }).select('+password id email');
        let transporter = nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            auth: {
                user: "apikey",
                pass: process.env.SENDGRID_API_KEY
            }
        })
        transporter.sendMail({
            from: 'juntosifpb@gmail.com',
            to: user.email,
            subject: 'Exclusão de conta',
            text: `Olá! Você excluiu sua conta no sistema Juntos pelo IFPB.`
        });
        return res.status(200).send({ status: 'Ok' });
    } catch (err) {
        return res.status(400).send('Falha ao excluir conta.');
    }
});



module.exports = router;
