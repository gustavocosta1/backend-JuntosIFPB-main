const {Router} = require("express")
const  bodyParser = require('body-parser')
const express = require("express")
const app = express()
const router = Router()
const nodemailer = require('nodemailer');
const Demand = require('../app/models/demand');

app.use(express.json());

router.post("/contato",  (req, res) => {

    res.json({
        email: req.body.email,
        description: req.body.description
        
    })
    require('dotenv').config();
    const nodemailer = require("nodemailer");

    let transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
            user: "apikey",
            pass: process.env.SENDGRID_API_KEY
        }
    })

    transporter.sendMail({
        from: "juntosifpb@gmail.com", // verified sender email
        to: req.body.email, // recipient email
        subject: 'Solicitação',
        text: 'Contato recebido. Em breve sua solicitação será analisada.',
      });
      
    transporter.sendMail({
        from: 'juntosifpb@gmail.com',        
        to: 'juntosifpb@gmail.com',
        subject: req.body.email,
        text: req.body.description,        
        });

    /*
    let transporter = nodemailer.createTransport({
        //host: 'smtp.gmail.com',
        //port: 587,
        //secure: true, //para funcionar é necessario ativar o uso de aplicativos menos seguros na segurança do gmail https://myaccount.google.com/lesssecureapps
        //host: 'smtp-mail.hotmail.com',                  // hostname
        service: 'hotmail',                             // service name
        secureConnection: false,
        tls: {
            ciphers: 'SSLv3'                            // tls version
        },
        port: 587,
        auth: {            
            user: 'juntosifpb@hotmail.com',
            pass: '2022ifpbjuntos'
        }
    });

    transporter.sendMail({
        from: 'juntosifpb@hotmail.com',        
        to: req.body.email,
        subject: 'Solicitação',
        text: 'Contato recebido. Em breve sua solicitação será analisada.',        
    });
    */
})



module.exports = router;