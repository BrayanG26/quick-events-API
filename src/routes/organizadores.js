const { Router } = require('express');
const _ = require('underscore');
const router = Router();

const organizadores = require('../organizadores.json');

// Listar todos los organizadores
router.get('/', (req, res) => {
    var flag = false, response = {}, queries = {};
    response.success = false;
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
                response.success = true;
                response.msg = 'The user exists';
            }
        });
        if (!response.success) {
            response.msg = 'The user not exists';
        }
        res.status(200).json(response);
    } else {
        res.status(400).json({ error: 'I need a userName and password' });
    }

});

// Obtener organizador por su ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    var response = {};
    _.each(organizadores, (organizador, i) => {
        if (organizador.id == id) {
            response.msg = "The user was found successfully";
            response.organizador = organizador;
            response.success = true;
            delete response.organizador.password;
        }
    });
    if (response) {
        console.log(response);
        res.status(200).json(response);
    } else {
        res.status(404).json({ error: 'Resource not found :(' });
    }
});

// Modificar un organizador
router.put('/:id', (req, res) => {
    console.log('put method organizadores');
    console.log(req.body);
    var response = {};
    const { id } = req.params;
    const { email, usuario, password, nPassword, nombres, apellidos, organizacion } = req.body;
    _.each(organizadores, (organizador, i) => {
        if (organizador.id == id) {
            console.log(organizador);
            if (nPassword) {
                console.log('ud desea modificar su contraseña');
                console.log(password);
                console.log(organizador.password);
                if (organizador.password == password) {
                    console.log('verificar si coinciden las contraseñas');
                    organizador.password = nPassword;
                    console.log(organizador);
                    response.success = true;
                    response.organizador = organizador;
                    delete response.organizador.password;
                    res.status(200).json(response);
                } else {
                    console.log('Your password was wrong');
                    res.status(500).json({ success: false, msg: 'Your password was wrong' });
                }
            } else {
                console.log('ud no desea modificar su contraseña');
                const updated = { ...req.body, id };
                console.log(updated);
                organizadores[i] = updated;
                response.success = true;
                response.organizador = organizador;
                delete response.organizador.password;
                res.status(200).json(response);
            }
        }
    });
});

module.exports = router;