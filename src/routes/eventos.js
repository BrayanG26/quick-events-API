const { Router } = require('express');
const _ = require('underscore');
const router = Router();

const eventos = require('../eventos.json');

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
        // var estado = req.query.estado;
        _.each(eventos, (evento, i) => {
            var pos = 0, check = true;
            var qKeys = Object.keys(queries);

            while (qKeys[pos] && check) {
                // console.log("clave -> " + qKeys[pos]);
                // console.log("Valor clave de evento "+evento[qKeys[pos]]);
                // console.log("pos actual -> " + pos);
                var vEvent = evento[qKeys[pos]],
                    vQuery = queries[qKeys[pos]];

                if (vEvent) {
                    console.log(vEvent + " == " + vQuery);
                    if (!(vEvent == vQuery)) {
                        check = false;
                    }
                } else {
                    res.status(400).json({ error: 'At least one filter was wrong' });
                }
                if (pos == (qKeys.length - 1) && check) {
                    console.log("se hicieron las comparaciones necesarias");
                    console.log(evento);
                    response.push(evento);
                }
                pos++
            }

            /* _.each(queries, (value, key) => {
                if (evento[key]) {
                    if (evento[key] == value) {
                        response.push(evento);
                    }
                } else {
                    res.status(400).json({ error: 'At least one filter was wrong' });
                }
            }); */
        });
        console.log("Respuesta enviada al cliente");
        console.log(response);
        res.status(200).json(response);
    }
});

router.get('/:id', (req, res) => {
    const { id } = req.params;
    var response;
    _.each(eventos, (evento, i) => {
        if (evento.id == id) {
            response = evento;
        }
    });
    if (response) {
        res.status(200).json(response);
    } else {
        res.status(404).json({ error: 'Resource not found :(' });
    }
});

router.post('/', (req, res) => {
    const { nombre, ciudad, lugar, fecha, hora, descripcion, url, categoria, capacidad, costo } = req.body;
    const id = eventos.length + 1;
    const newEvento = { ...req.body, id };
    console.log(newEvento);
    res.status(200).json(newEvento);
});

router.put('/:id', (req, res) => {
    console.log(req.body);
    res.status(200).json(req.body);
});
module.exports = router;