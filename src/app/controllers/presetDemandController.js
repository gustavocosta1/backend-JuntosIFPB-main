const express = require("express");
const PresetDemand = require("../models/presetDemand");
const mongoose = require("../../database");
//const router = express.Router();
//router.use(express.json());
const Admin = require("../models/admin");
const authMiddleware = require('../middlewares/auth')

//router.use(authMiddleware);
const app = express()
const {Router} = require("express")
const router = Router()
app.use(express.json());


router.get("/listPresetDemands", async (req, res) => {
  try {    
    
      const title = req.body.title;
      const demands = await PresetDemand.find();

      if(demands.length === 0){
        return res.status(400).send({error:"Não há demandas"})
      }

      if(!await PresetDemand.findOne({title: title}) ){
        return res.status(200).send({ ok: "Demanda não encontrada" });
      }    
      return res.status(200).send({ ok: await PresetDemand.findOne({title: title})});
    
  } catch (err) {
    return res.status(400).send({ error: "Erro ao listar demandas" });
  }
});


router.get("/listAllPresetDemands", async (req, res) => {
  try {

      const demands = await PresetDemand.find();
      if(demands.length === 0){
        return res.status(400).send({error:"Não há demandas"})
      }
      return res.status(200).send({ ok: demands });
    
  } catch (err) {
    return res.status(400).send({ error: "Erro ao listar demandas" });
  }
});



module.exports = router;