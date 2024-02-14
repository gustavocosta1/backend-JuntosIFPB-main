const express = require("express")
const Admin = require("../models/admin")
const Status = require("../models/status");
const Sector = require("../models/sector");
const authMiddleware = require('../middlewares/auth')
const validator = require("email-validator");
const mongoose = require("../../database");
const PresetDemand = require("../models/presetDemand");
const router = express.Router()

router.use(authMiddleware)

router.post("/", async (req, res) => {
  try {
    const { id } = req.body
    /* console.log(id) */
    /* console.log(req.body.id) */
    /* const admin =  */
    if ((await Admin.findOne({ adminId: id }).select('+adminId'))) {
      return res.status(200).send({ status: 'ok' });
    };
    return res.status(400).send({ error: 'Usuário não é administrador' })
    /* console.log(admin.adminId) */
    /* if(admin.adminId === id){ */
    /* return res.status(200).send({status: 'ok'}); */
    /* }
    return res.status(400).send({error: 'Usuário não é administrador'})
  } */
  }
  catch (e) {
    return res.status(400).send({ error: 'Erro ao verificar o administrador' })
  }
});

router.get("/isAdmin/", async (req, res) => {
  try {
    
    if ((await Admin.findOne({ adminId: req.userId }).select('+adminId'))) {
      return res.status(200).send({ ok: true })
    }
    return res.status(200).send({ ok: false })
  }
  catch (e) {
    return res.status(400).send({ error: 'Erro ao verificar o administrador' })
  }
});


router.post("/sector", async (req, res) => {
  try {

    const isAdmin = await Admin.findOne({ adminId: req.userId })

    if (isAdmin) {
      const { title, email } = req.body

      if (await Sector.findOne({ title: title })) {
        return res.status(400).send({ error: "Setor já cadastrado" })
      }

      if (await Sector.findOne({ email: email })) {
        return res.status(400).send({ error: "Email já cadastrado" })
      }

      if (!validator.validate(email)) {
        return res.status(400).send({ error: "Email inválido" })
      }


      const sector = await Sector.create({
        title: title,
        email: email
      });

      return res.status(200).send({ ok: sector })
    }
    else {
      return res.status(400).send({ error: "Não autorizado" });
    }
  } catch (err) {
    return res.status(500).send({ error: "Erro ao cadastrar setor" });
  }

});
router.delete("/deleteAllSector", async (req, res) => {
  try {
    const isAdmin = await Admin.findOne({ adminId: req.userId })

    if (isAdmin) {
      const sectors = await Sector.find();
      if (sectors.length === 0) {
        return res.status(400).send({ error: "Não há setores" })
      }
      await Sector.deleteMany();
      return res.status(200).send({ ok: "Todos os setores foram deletados" })
    }
    else {
      return res.status(400).send({ error: "Não autorizado" });
    }
  } catch (err) {
    return res.status(400).send({ error: "Erro ao deletar todos os setores" })
  }
});

router.delete("/deleteSector/:sector", async (req, res) => {
  try {
    const isAdmin = await Admin.findOne({ adminId: req.userId })

    if (isAdmin) {
      
      const sector = await Sector.find()
      if (sector.length === 0) {
        return res.status(400).send({ error: "Não há setores" })
      }

      if (!await Sector.findOne({ title: req.params.sector })) {
        return res.status(400).send({ error: "Setor não encontrado" });
      }

      await Sector.deleteOne({ title: req.params.sector });
      return res.status(200).send({ ok: "Setor deletado" });
    }
    else {
      return res.status(400).send({ error: "Não autorizado" });
    }
  } catch (err) {
    return res.status(400).send({ error: "Erro ao deletar setor" });
  }
});
router.post("/status", async (req, res) => {
  try {

    const isAdmin = await Admin.findOne({ adminId: req.userId })

    if (isAdmin) {
      const title = req.body.title;
      const status = await Status.findOne({ title: title });
      if (status) {
        return res.status(400).send({ error: "Status já existe" });
      }
      const newStatus = new Status({
        title: title,
      });
      await newStatus.save();
      return res.status(200).send({ ok: newStatus });
    }
    else {
      return res.status(400).send({ error: "Não autorizado" });
    }
  } catch (err) {
    return res.status(400).send({ error: "Erro ao criar status" });
  }
});



router.delete("/deleteStatus/:status", async (req, res) => {
  try {
    const isAdmin = await Admin.findOne({ adminId: req.userId })
    if (isAdmin) {
      
      const status = await Status.findOneAndDelete({ title: req.params.status });
      if (!status) {
        return res.status(400).send({ error: "Status não existe" });
      }
      return res.status(200).send({ ok: status });
    }
    else {
      return res.status(400).send({ error: "Não autorizado" });
    }
  } catch (err) {
    return res.status(400).send({ error: "Erro ao deletar Status" });
  }
});


router.delete("/deleteAllStatus", async (req, res) => {
  try {
    const isAdmin = await Admin.findOne({ adminId: req.userId })
    if (isAdmin) {
      const statuses = await Status.deleteMany();
      if (!statuses) {
        return res.status(400).send({ error: "Não há status" });
      }
      return res.status(200).send({ ok: statuses });
    }
    else {
      return res.status(400).send({ error: "Não autorizado" });
    }
  } catch (err) {
    return res.status(400).send({ error: "Erro ao deletar status" });
  }
}
);



router.post("/presetDemand", async (req, res) => {
  try {
    const isAdmin = await Admin.findOne({ adminId: req.userId })

    if (isAdmin) {
      const title = req.body.title;
      const demand = await PresetDemand.findOne({ title: title });
      if (demand) {
        return res.status(400).send({ error: "Demanda já existe" });
      }
      const newPresetDemand = new PresetDemand({
        title: title,
      });
      await newPresetDemand.save();
      return res.status(200).send({ ok: newPresetDemand });
    }
    else {
      return res.status(400).send({ error: "Não autorizado" });
    }
  } catch (err) {
    return res.status(400).send({ error: "Erro ao criar demanda" });
  }
});

router.delete("/deletePresetDemand/:demand", async (req, res) => {
  try {
    const isAdmin = await Admin.findOne({ adminId: req.userId })

    if (isAdmin) {
      
      const demand = await PresetDemand.findOneAndDelete({ title: req.params.demand });
      if (!demand) {
        return res.status(400).send({ error: "Demanda não existe" });
      }
      return res.status(200).send({ ok: demand });
    }
    else {
      return res.status(400).send({ error: "Não autorizado" });
    }
  } catch (err) {
    return res.status(400).send({ error: "Erro ao deletar demanda" });
  }
});


router.delete("/deleteAllPresetDemands", async (req, res) => {
  try {
    const isAdmin = await Admin.findOne({ adminId: req.userId })

    if (isAdmin) {
      const demands = await PresetDemand.deleteMany();
      if (!demands) {
        return res.status(400).send({ error: "Não há demandas" });
      }
      return res.status(200).send({ ok: demands });
    }
    else {
      return res.status(400).send({ error: "Não autorizado" });
    }
  } catch (err) {
    return res.status(400).send({ error: "Erro ao deletar demanda" });
  }
}
);


router.get('/isLoggedIn', async (req, res) => {
  try {
    res.status(200).send({ status: 'Ok' });

  } catch (err) {
    res.status(400).send({ error: 'Não está logado' });
  }
});

module.exports = router