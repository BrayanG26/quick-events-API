const { Router } = require('express');
const _ = require('underscore');
const router = Router();

const eventos = require('../eventos.json');

// Listar todos los eventos
router.get('/', (req, res) => {
    var flag = true, response = [], queries = {};

    for (var key in req.query) {
        if (req.query.hasOwnProperty(key)) {
            queries[key] = req.query[key];
            flag = false;
        }
    }
    console.log(queries);


    if (flag) {
        res.status(200).json(eventos);
    } else {
        _.each(eventos, (evento, i) => {
            var pos = 0, check = true;
            var qKeys = Object.keys(queries);

            while (qKeys[pos] && check) {
                var vEvent = evento[qKeys[pos]],
                    vQuery = queries[qKeys[pos]];

                if (vEvent) {
                    if (!(vEvent == vQuery)) {
                        check = false;
                    }
                } else {
                    res.status(400).json({ error: 'At least one filter was wrong' });
                }
                if (pos == (qKeys.length - 1) && check) {
                    response.push(evento);
                }
                pos++
            }
        });
        res.status(200).json(response);
    }
});

// Obtener un evento especifico
router.get('/:id', (req, res) => {
    const { id } = req.params;
    var response;
    _.each(eventos, (evento, i) => {
        if (evento.id == id) {
            response = evento;
        }
    });
    if (response) {
        console.log(response);
        res.status(200).json(response);
    } else {
        res.status(404).json({ error: 'Resource not found :(' });
    }
});

// Crear un nuevo evento
router.post('/', (req, res) => {
    const { nombre, ciudad, lugar, fecha, hora, descripcion, url, categoria, capacidad, costo } = req.body;
    const id = 200 + eventos.length + 1;
    const newEvento = { ...req.body, id };
    console.log(newEvento);
    res.status(200).json(id);
});

// Modificar un evento
router.put('/:id', (req, res) => {
    console.log(req.body);
    res.status(200).json(req.body);
});

// Subir imagenes de un evento
router.post('/:id/images', (req, res) => {
    const { id } = req.params;
    // const { nombre, ciudad, lugar, fecha, hora, descripcion, url, categoria, capacidad, costo } = req.body;
    // const id = eventos.length + 1;
    // const newEvento = { ...req.body, id };
    // console.log(newEvento);
    // res.status(200).json(newEvento);
    console.log('route id: '+id);
    console.log(req.file);
    _.each(req.body, (elemento, i) => {
        console.log(elemento.file);
    });
});
module.exports = router;