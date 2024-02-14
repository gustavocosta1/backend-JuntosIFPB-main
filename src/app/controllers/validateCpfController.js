const express = require("express");
const mongoose = require("../../database");
const Outsourced = require("../models/outsourced");
const { validate } = require("gerador-validador-cpf");
const bcrypt = require("bcryptjs");

const app = express()

const {Router} = require("express")
const router = Router()
const User = require("../models/user");

app.use(express.json());

router.post("/", async (req, res) => {
  
  const { cpf, isOutsourced } = req.body;
  try {
      const user = await Outsourced.find();
      if (!isOutsourced && cpf.length === 0) {
        return res.status(200).send({ ok: "Conta válida" });
      }
      else if(isOutsourced){
      for (let i = 0; i < user.length; i++) {
        if (await bcrypt.compare(cpf, user[i].cpf)) {
          if (user[i].isAuthenticated) {
            return res.status(400).send({ error: "CPF já cadastrado" });
          }
          return res.status(200).send({ ok: "CPF válido" });
        }
      }
    }
    if(isOutsourced === false){
      return res.status(400).send({ error: "Conta inválida" });
      }
    return res.status(400).send({ error: "CPF inválido" });
  
  
} catch (e) {
    return res.status(400).send({ error: "Erro ao validar CPF" });
  }
});

// check if user is outsourced
router.post("/isOutsourced", async (req, res) => {

  const { id } = req.body || {};
  try {
    const user = await User.findById(id);
    if (user.isOutsourced) {
      return res.status(200).send({ ok: "É terceirizado" });
    }
    return res.status(400).send({ error: "Não é terceirizado" });
  }
  catch (e) {
    return res.status(400).send({ error: "Erro ao verificar se é terceirizado" });
  }
});

module.exports = router;