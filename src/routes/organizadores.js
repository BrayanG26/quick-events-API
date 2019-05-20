const { Router } = require('express');
const _ = require('underscore');
const router = Router();

const organizadores = require('../organizadores.json');

router.get('/', (req, res) => {
    var flag = false, response = {}, queries = {};
    response.validation = false;
    for (var key in req.query) {
        if (req.query.hasOwnProperty(key)) {
            queries[key] = req.query[key];
        }
    }
    if (Object.keys(req.query).length) {
        flag = true;
    }
    console.log(queries);
    if (flag) {
        var usuario = queries['usuario'] || '';
        var password = queries['password'] || '';
        _.each(organizadores, (organizador, i) => {
            if (organizador['usuario'] == usuario && organizador['password'] == password) {
                response.idUser = organizador.id;
                response.validation = true;
                response.msg = 'The user exists';
            }
        });
        if (!response.validation) {
            response.msg = 'The user not exists';
        }
        console.log(response);        
        res.status(200).json(response);
    } else {
        res.status(400).json({ error: 'I need a userName and password' });
    }

});

router.get('/:id', (req, res) => {
    const { id } = req.params;
    var response;
    _.each(organizadores, (organizador, i) => {
        if (organizador.id == id) {
            response = organizador;
        }
    });
    if (response) {
        res.status(200).json(response);
    } else {
        res.status(404).json({ error: 'Resource not found :(' });
    }
});

module.exports = router;