const express = require("express");
const Status = require("../models/status");
const mongoose = require("../../database");
const router = express.Router();



router.use(express.json());
//router.use(authMiddleware);


router.get("/status", async (req, res) => {
  try {
      const title = req.body.title;
      const statuses = await Status.find();

      if(statuses.length === 0){
        return res.status(400).send({error:"Não há status"})
      }

      if(!await Status.findOne({title: title}) ){
        return res.status(200).send({ ok: "Status não encontrada" });
      }    
      return res.status(200).send({ ok: await Status.findOne({title: title})});
    }
   catch (err) {
    return res.status(400).send({ error: "Erro ao listar status"});
  }
});


router.get("/listAllStatus", async (req, res) => {
  try {
    const statuses = await Status.find();
    if(statuses.length === 0){
    return res.status(400).send({error:"Não há status"});
    }
    return res.status(200).send({ ok: statuses });
    
  } catch (err) {
    return res.status(400).send({ error: "Erro ao listar status"});
  }
});





module.exports = router;