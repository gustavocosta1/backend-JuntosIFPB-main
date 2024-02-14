const express = require("express")
const mongoose = require("../../database");
const Demand = require('../models/demand');
const Status = require("../models/status");
const app = express()
const { Router } = require("express")
const router = Router()

app.use(express.json());

router.get('/', async (req, res) => {
    try {
        const demands = await Demand.find().populate(['user']);
        return res.send({ demands });
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao carregar demandas' });
    }
});

router.get('/findSectorOrder', async (req, res) => {
    try {
        const { sector } = req.query
        if (sector === "") {
            const demandsFiltered = await Demand.find().populate(['user']).sort({ support: -1 });
            return res.send({ demandsFiltered });
        }
        else if (sector === "Recentes") {
            const demandsFiltered = await Demand.find().populate(['user']).sort({ createdAt: -1 });
            return res.send({ demandsFiltered });
        }

        else if (sector === "Antigos") {
            const demandsFiltered = await Demand.find().populate(['user']).sort({ createdAt: 1 });
            return res.send({ demandsFiltered });
        }
        const demands = await Demand.find().populate(['user']).sort({ support: -1 });
        const demandsFiltered = demands.filter(elem => elem.sector === sector)
        return res.send({ demandsFiltered });
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao carregar demandas' });
    }
});

router.get('/findsupportasc', async (req, res) => {
    try {
        const demands = await (Demand.find().populate(['user'])).sort({ support: 1 })
        return res.send({ demands });
    } catch (err) {
        return res.status(400).send({ erro: 'Erro ao carregar demandas asc' });
    }
});

router.get('/findsupportdesc', async (req, res) => {
    try {
        const demands = await (Demand.find().populate(['user'])).sort({ support: -1 })
        return res.send({ demands });
    } catch (err) {
        return res.status(400).send({ erro: 'Erro ao encontrar suporte desc' });
    }
});

router.get('/findDateDesc', async (req, res) => {
    try {
        const demands = await (Demand.find().populate(['user'])).sort({ createdAt: -1 });
        return res.send({ demands });
    } catch (err) {
        return res.status(400).send({ erro: 'Erro ao encontrar data desc' });
    }
});

router.get('/search', async (req, res) => {
    try {


        const { querySearch } = req.query

        const demands = await (Demand.find().populate(['user'])).sort({ support: -1 })

        const demandsFilteredStartsWith = demands.filter(elem => (elem.title.toLowerCase().startsWith(querySearch.toLowerCase())))




        const demandsFiltered2 = /* [...demandsFilteredStartsWith,  */demands.filter(elem => (
            !elem.title.toLowerCase().startsWith(querySearch)) && elem.title.toLowerCase().includes(querySearch)
        )

        const demandsFiltered = demandsFilteredStartsWith.concat(demandsFiltered2)



        if (demandsFiltered.length < 1) {

            return res.status(200).send('Não foram encontradas consultas')
        }
        res.send({ demandsFiltered });
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao buscar demanda' });
    }
});

router.get('/findDateAsc', async (req, res) => {
    try {
        const { dateAsc } = req.query
        const demands = await Demand.find().populate(['user']).sort({ createdAt: 1 });
        return res.send({ demands });
    } catch (err) {
        return res.status(400).send({ erro: 'Erro ao encontrar data asc' });
    }
});

router.get('/getStatuses', async (req, res) => {
    try {

        const statuses = await Status.find()
        
        return res.status(200).send({ statuses })
    }
    catch (err) {
        return res.status(400).send({ error: 'Erro ao buscar lista de status' });
    }
})

router.get('/:demandId', async (req, res) => {
    try {
        const demands = await Demand.findById(req.params.demandId).populate(['user']);
        return res.send({ demands });
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao carregar demandas' });
    }
});



module.exports = router;