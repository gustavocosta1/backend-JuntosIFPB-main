const express = require("express");
const mongoose = require("../../database");
const Outsourced = require("../models/outsourced");
const Demand = require("../models/demand");
const Sector = require("../models/sector");
const router = express.Router();
const { validate } = require("gerador-validador-cpf");
const bcrypt = require("bcryptjs");
const Admin = require("../models/admin");
const authMiddleware = require('../middlewares/auth')
router.use(authMiddleware);


router.post("/", async (req, res) => {
  try {
    const isAdmin = await Admin.findOne({adminId: req.userId})
    
    if(isAdmin){
      const { cpf, sector, email } = req.body;

      const user = await Outsourced.find();

      if (!await Sector.findOne({title: sector})) {
        return res.send({ error: "Setor não existe no sistema" });
      }
      
      if(email && !await Outsourced.findOne({email: req.body.email})){
        
        const tec = await Outsourced.create({
          email: req.body.email,
          sector: req.body.sector,
          cpf: ""
        });
        
        return res.send({ tec });
      }

      for (let i = 0; i < user.length; i++) {      
        if (await bcrypt.compare(cpf, user[i].cpf)) {
          return res.send({ error: "Esse servidor já existe no sistema" });
        }     
      }
      
      if (!validate(cpf.toString())) {
        return res.send({ error: "CPF não é válido" });
      }
      
      

      const outsourced = await Outsourced.create({
        cpf: cpf,
        sector: sector,
      });
      return res.send({ outsourced });
    }else{
      return res.status(400).send({ error: "Não autorizado" });
    }
  } catch (err) {
    
    return res
      .status(400)
      .send({ error: "Não foi possível cadastrar o servidor no sistema" });
  }
});

router.post("/outsourcedSector/", async (req, res) => {

  try {
   
    const outsourced = await Outsourced.findOne({userId: req.userId});
    if(outsourced){
      const demands = await Demand.find({sector: outsourced.sector});
      return res.send({demands});
    }else{
      return res.send({error: "Não é um terceirizado"})
    }
  } catch (err) {
    return res.send({error: "Erro ao buscar setor"})
  }
})

router.delete("/deleteCpf/:cpf", async (req, res) => {
  try {
    const isAdmin = await Admin.findOne({adminId: req.userId})
    
    if(isAdmin){
      
      const user = await Outsourced.find();    
      for (let i = 0; i < user.length; i++) {      
        if (await bcrypt.compare(req.params.cpf, user[i].cpf)) {
          await Outsourced.findByIdAndDelete(user[i].id);  
              
          return res.status(200).send({ ok: "Terceirizado deletado" });
        }     
      }
      return res.status(400).send({error: "Terceirizado não encontrado."});
  }
  else{
    return res.status(400).send({ error: "Não autorizado" });
  }
  } catch (err) {
    return res.status(400).send({ error: "Erro ao excluir Terceirizado" });
  }
});

router.delete("/deleteEmail/:email", async(req,res) => {
  try{
    const isAdmin = await Admin.findOne({adminId: req.userId})
    
    if(isAdmin){
      const user = await Outsourced.findOne({email: req.params.email});
      if(user){
        
        await Outsourced.findByIdAndDelete(user.id)
        return res.status(200).send({ ok: "Téc Administrativo deletado" });
      }
      else{
        return res.status(400).send({error: "Téc Administrativo não encontrado"})
      } 
    }
  }
  catch(err){
    return res.status(400).send({error: "Erro ao deletar Téc Administrativo"})
  }
})

module.exports = router;
