const { Router } = require('express');
const _ = require('underscore');
const router = Router();
const multer = require('multer');
const path = require('path');

const eventos = require('../eventos.json');

// Set storage engine
const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function (req, file, cb) {
        const { id } = req.params;

        cb(null, id + '-' + file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init upload
const upload = multer({
    storage: storage
}).array('images', 10);

// Returns an array of dates between the two dates
const getDates = function (star, end) {
    var startDate = new Date(star), endDate = new Date(end);
    var dates = [],
        currentDate = startDate,
        addDays = function (days) {
            var date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        };
    while (currentDate <= endDate) {
        dates.push(currentDate);
        currentDate = addDays.call(currentDate, 1);
    }
    return dates;
};

// Listar todos los eventos
router.get('/', (req, res) => {
    var flag = true, response = [], queries = {}, byDates;

    for (var key in req.query) {
        if (req.query.hasOwnProperty(key)) {
            queries[key] = req.query[key];
            flag = false; // Valida si no existe ningún queryparam en la consulta
        }
    }
    
    var fromKey = _.findKey(queries, function (value, key) {
        return key.indexOf('from') >= 0;
    });

    byDates = (fromKey) ? true : false; // Si en la consulta existe 'from', sabe que debe hacer una busqueda entre las fechas
    var qKeys = Object.keys(queries);
    if (byDates) {
        qKeys = _.difference(qKeys, ['from', 'to']);
    }


    if (flag) {
        res.status(200).json(eventos);
    } else {
        _.each(eventos, (evento, i) => {
            var pos = 0, hit = 0;
            while (qKeys[pos]) {
                var vEvent = evento[qKeys[pos]].toString(),
                    vQuery = queries[qKeys[pos]].toString();
                if (!(typeof vEvent === 'undefined')) {
                    if (vEvent == vQuery) {
                        hit += 1;
                        if (hit == qKeys.length) {
                            response.push(evento);
                        }
                    }
                } else {
                    res.status(400).json({ error: 'At least one filter was wrong' });
                }
                pos++;
            }
        });

        if (byDates) {
            var star = queries.from, end = queries.to;
            var dates = getDates(star, end);
            var newResponse = response;
            response = [];
            
            _.each(newResponse, (evento, i) => {
                _.each(dates, (date, i) => {
                    if (new Date(evento.fecha).toDateString() == new Date(date).toDateString()) {
                        response.push(evento);
                    }
                });
            });
        }
        
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
    console.log('put method eventos.js');
    console.log(req.body);
    res.status(200).json(req.body);
});

// Subir imagenes de un evento
router.post('/:id/images', (req, res) => {
    const { id } = req.params;
    var response = {};
    // const { nombre, ciudad, lugar, fecha, hora, descripcion, url, categoria, capacidad, costo } = req.body;
    // const id = eventos.length + 1;
    // const newEvento = { ...req.body, id };
    // console.log(newEvento);
    // res.status(200).json(newEvento);

    upload(req, res, (err) => {
        var portada = req.body.portada || req.files[0].originalname;
        response.imagenes = [];
        // console.log(req.originalUrl);
        // console.log(req.body.portada);
        // console.log(req.files);

        // Generar json de respuesta
        _.each(req.files, (file, i) => {
            var imagen = {};
            console.log(file);
            imagen.name = file.filename;
            imagen.url = req.originalUrl + '/' + file.filename;
            imagen.cover = (file.originalname == portada) ? true : false;
            response.imagenes.push(imagen);
        });

        if (err) {
            console.log('There was an error...');
            console.log(err);
            response.success = false;
        } else {
            response.success = true;
            _.each(eventos, (evento, i) => {
                console.log(evento.id);
                if (evento.id == id) {
                    evento.imagenes = response.imagenes;
                }
            });
            res.status(200).json(response);
            console.log('There was not any error');
            console.log(response);
        }
    });
});
module.exports = router;