const express = require("express")
const mongoose = require("../../database");
const Demand = require('../models/demand');
const router = express.Router()
const authMiddleware = require('../middlewares/auth')
const mailer = require ('../../modules/mailer');
const nodemailer = require('nodemailer');
const Sector = require('../models/sector');
const Status = require('../models/status');
require('dotenv').config();

router.use(authMiddleware)

/*router.get('/:demandId', async (req, res) => {
    try {
        const demands = await Demand.findById(req.params.demandId).populate(['user']);
        return res.send({ demands });
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao carregar demandas' });
    }
}); */


router.post('/', async (req, res) => {
    try {             
        const {title, description, isAnonymous, sector} = req.body;
       
        const demand = await Demand.create({
            title: title, 
            description: description, 
            user: req.userId, 
            sector:sector,
            isAnonymous: isAnonymous, 
            supportUsers: req.userId, 
            status: "Atribuído"});
        await demand.save();  
        return res.send({ demand });     
    } catch (err) {
        
        return res.status(400).send({ error: 'Erro ao criar nova demanda' });
    }
});

router.put('/support/:demandId', async(req, res) => {
    try {
        const demand = await Demand.findById(req.params.demandId)
        if ((demand.supportUsers).includes(req.userId)){
            const index = demand.supportUsers.indexOf(req.userId)
            if (index > -1) {
                demand.supportUsers.splice(index, 1);                
            }            
        }
        else{
            demand.supportUsers.push(req.userId);            
        }
        demand.support = parseInt(demand.supportUsers.length);
        await demand.save();
        return res.send({demand});
        }    
    catch (err) {
        return res.status(400).send({error: 'Erro ao atualizar o suporte'});
    }
});

router.put('/:demandId/status', async (req, res) => {
    try {
        const {status} = req.body;

        const demand = await Demand.findById(req.params.demandId);
        const statusQuery = await Status.findOne({title: status})

        if(statusQuery.title === demand.status){
            return res.status(400).send({error: 'Status já cadastrado'});
        }
        
        await demand.set({status: statusQuery.title}).save();
        
        return res.send({demand});
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao atualizar o status' });
    }
});

router.put('/sector/:demandId', async (req, res) => {
    try {
        const {sector} = req.body;
        
        const demand = await Demand.findById(req.params.demandId);
        const sectorQuery = await Sector.findOne({title: sector})

        if(sectorQuery.title === demand.sector){
            return res.status(400).send({error: 'Setor já cadastrado'});
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
            to: sectorQuery.email, 
            subject: 'Encaminhamento de demanda',
            text: `Olá! Você recebeu uma demanda. Leia a seguir:\n\n ${demand.title}.\n ${demand.description}`
        });

        await demand.set({sector: sectorQuery.title}).save();


        return res.send({demand});

    } catch (err) {
        return res.status(400).send({ error: 'Erro ao atualizar o setor' });
    }
});

router.delete('/:demandId', async (req, res) => {
    try {
        
        const demands = await Demand.findByIdAndRemove(req.params.demandId);
        if (!demands) {
            return res.status(400).send({ error: "Demanda não existe" });
            }
        return res.status(200).send({status: 'Ok'});
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao excluir demandas' });
    }
});



router.delete('/delete/all', async (req, res) => {
    try {
       
        const demands = await Demand.deleteMany();
        if (!demands) {
        return res.status(400).send({ error: "Não há demandas"});
        }
        return res.status(200).send({ok: demands});
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao excluir demandas' });
    }
    });


router.put('/updateDemand', async (req, res) => {
    try {
        const {demands} = req.body
        for (let i = 0; i < demands.length; i++) {
            if ('status' in demands[i]){
                const busca = await Status.find({title: demands[i].status});
                if(busca.length < 1){
                    return res.status(400).send({error: 'Status não encontrado'});
                }                
                //let demand = await Demand.findById(demands[i].id);
                //await demand.set({status: demands[i].status}).save();
                await Demand.findByIdAndUpdate(demands[i].id,{
                    '$set':{
                        status: demands[i].status
                    }
                })
            }
            else if ('sector' in demands[i]){                
                const busca = await Sector.find({title: demands[i].sector});                
                if(busca.length < 1){
                    return res.status(400).send({error: 'Setor não encontrado'});
                }                
                //let demand = await Demand.findById(demands[i].id);            
                //await demand.set({sector: demands[i].sector}).save();
                await Demand.findByIdAndUpdate(demands[i].id,{
                    '$set':{
                        sector: demands[i].sector
                    }
                })
            }
            else{
                return res.status(400).send({error: 'Erro ao procurar Status/Setor'})
            }        
        }
        return res.send({demands});
    }catch (err) {
        return res.status(400).send({ error: 'Erro ao atualizar o Status' });
        
    }
});

router.put('/demandSector', async (req, res) => {
    try {
        const {demands} = req.body
        const busca = await Sector.find({title: demands[0].sector});
        if(busca.length < 1){
            return res.status(400).send({error: 'Setor não encontrado'});
        }
        for (let i = 0; i < demands.length; i++) {
            let demand = await Demand.findById(demands[i].id);            
            await demand.set({sector: demands[i].sector}).save();
        }
        return res.send({demands});
    }
    catch (err) {
        return res.status(400).send({ error: 'Erro ao atualizar o setor' });
    }

});

module.exports = router;