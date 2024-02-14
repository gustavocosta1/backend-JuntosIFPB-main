const express = require("express");
const Sector = require("../models/sector");
const mongoose = require("../../database");
const app = express()
const {Router} = require("express")
const router = Router()

app.use(express.json());


router.get("/listSector", async (req, res) => {
  try {
      const title = req.body.title;
      const sector = await Sector.findOne({ title: title });
      if(sector){
        return res.status(200).send({ ok: sector });
      };

      return res.status(400).send({ error: "Nenhum setor encontrado" });
  } catch (err) {
    return res.status(400).send({ error: "Erro ao buscar setor" });
  }
});


router.get("/listAllSectors", async (req, res) => {
  try {
      const sectors = await Sector.find();
      if(sectors.length === 0){
        return res.status(400).send({error:"Não há setores"})
      }
      return res.status(200).send({ ok: sectors });
 
  } catch (err) {
    return res.status(400).send({ error: "Erro ao buscar setores" });
  }
  
});

module.exports = router;