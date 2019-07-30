const { Router } = require('express');
const _ = require('underscore');
const router = Router();
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: 'brayang26'
});
const eventos = require('../eventos.json');
const CLOUDINARY_UPLOAD_PRESET = 'zhz3blny';


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

const loopFiles = function (files, promises) {
    var first = 0, promise, imagen = {};
    var file = files[first], newFiles;
    if (file) {
        // 	console.log(file);
        // Hacer la promesa de cada archivo

        try {
            promise = cloudinary.uploader.unsigned_upload(file.path, CLOUDINARY_UPLOAD_PRESET);
            // console.log(promise);
            promises.push(promise);
            newFiles = _.without(files, file);
            // console.log(result);
            // console.log('ya se resolvió la promesa');
            // response.imagenes.push(imagen);
        } catch (e) {
            console.error('Cloudinary error: \n');
            console.error(e);
        }
        // console.log('array of promises');
        // console.log(promises);
        loopFiles(newFiles, promises);

    } else {
        console.log('finalizó la ejecución');
        console.log(promises);
        return promises;
    }

    /* promise.then(function (result) {
        console.log('Promise fullfiled...');
        console.log(result.secure_url);
        imagen.name = result.public_id;
        imagen.url = result.secure_url;
        imagen.cover = (file.originalname == portada) ? true : false;
        data.push(imagen);
        newFiles = _.without(files, file);
        // console.log(newFiles);
        console.log(newFiles);
        console.log('---+++---+++')
        console.log(data);
        loopFiles(newFiles, data);
    }).catch(function (error) {
        console.log('Promise rejected');
        console.log(error);
        console.log('finalizó la ejecución inesperadamente');
        reject();
        return 0;
    }); */
}

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
    const { organizador, nombre, lugar, fecha, hora, ciudad, capacidad, categoria, sePaga, url, descripcion, asistentes, meinteresa, compartido, megusta, estado, imagenes } = req.body;
    const id = 200 + eventos.length + 1;
    const newEvento = { ...req.body, id };
    var response = { success: false }, imagen = { url: 'http://1.bp.blogspot.com/-pabyR82U05A/UMlUcJFzEtI/AAAAAAAABhw/8uxaCD7iRKo/s1600/FOREST_SPRING.jpg', name: '', cover: true }
    var calificacion = {
        logistica: {
            "1": 5,
            "2": 3,
            "3": 5,
            "4": 8,
            "5": 1
        },
        comodidad: {
            "1": 5,
            "2": 4,
            "3": 3,
            "4": 8,
            "5": 2
        },
        entretenido: {
            "1": 5,
            "2": 3,
            "3": 4,
            "4": 8,
            "5": 2
        },
        interesante: {
            "1": 6,
            "2": 3,
            "3": 5,
            "4": 2,
            "5": 1
        }
    }
    if(estado == 'publicado'){
        newEvento.calificacion = calificacion;
    }
    console.log(newEvento);

    if (imagenes.length == 0) {
        imagenes.push(imagen);
        newEvento.imagenes = imagenes;
    } else {
        console.log('imagenes no existe');
    }
    newEvento.asistentes = 0;
    newEvento.meinteresa = 0;
    newEvento.compartido = 0;
    newEvento.megusta = 0;
    eventos.push(newEvento);
    response.evento = newEvento;
    response.msg = 'Se creó el evento exitosamente.';
    response.id = id;
    response.success = true;
    res.status(200).json(response);
});

// Modificar un evento
router.put('/:id', (req, res) => {
    console.log('put method eventos.js');
    const { id } = req.params;
    const { organizador, nombre, lugar, fecha, hora, ciudad, capacidad, categoria, sePaga, url, descripcion, asistentes, meinteresa, compartido, megusta, estado, calificacion, imagenes } = req.body;
    const updated = { ...req.body, id };
    var response = { success: false };

    _.each(eventos, (evento, i) => {
        if (evento.id == id) {
            /* if ((Array.isArray(imagenes) && imagenes.length)) {
                imagenes = evento.imagenes;
            } else { } */
            eventos[i] = updated;
            // eventos[i].imagenes = imagenes;
            response.success = true;
            response.evento = evento;
        }
    });
    // console.log(eventos);
    res.status(200).json(response);
});

// Subir imagenes de un evento
router.post('/:id/images', (req, res) => {
    var response = {
        success: false
    }, queries = {}, flag = false, portada;
    var promises = [];
    const { id } = req.params;
    // const { CLOUDINARY_URL } = 'https://api.cloudinary.com/v1_1/brayang26/image/upload';
    console.log('id - ' + id);
    console.log(req.query);
    // console.log(req.files)
    // console.log(req.get('Content-type'));
    // console.log(JSON.stringify(req.headers));
    // console.log(req.path);
    // console.log(req.originalUrl);
    // console.log(req.url);
    for (var key in req.query) {
        if (req.query.hasOwnProperty(key)) {
            queries[key] = req.query[key];
            flag = true; // Valida si no existe ningún queryparam en la consulta
        }
    }

    var coverKey = _.findKey(queries, function (value, key) {
        return key.indexOf('portada') >= 0;
    });


    upload(req, res, (err) => {
        // console.log('req.files');
        // console.log(req.files);
        // var portada = req.body.portada || req.files[0].originalname;
        if (coverKey != 'portada') {
            console.log('No envió correctamente la clave portada, revise el nombre de este atributo');
            // res.status(400).json({ error: 'No envió correctamente la clave portada, revise el nombre de este atributo', success: false });
        } else {

        }
        portada = queries[coverKey] || req.files[0].originalname;
        console.log(portada);
        console.dir('******', '--');

        // console.log(req.originalUrl);

        // Generar json de respuesta y subir imagenes a Cloudinary

        // La mejor prueba de toda la historia


        /* _.each(req.files, (file, i) => {
            var imagen = {};
            console.log(file);

            try {
                var result = cloudinary.uploader.unsigned_upload(file.path, CLOUDINARY_UPLOAD_PRESET);
                result.then(function (r) {
                    console.log(r.secure_url);
                }, function (error) {
                    console.log(error);
                });
                console.log(result);
                console.log('ya se resolvió la promesa');
                // imagen.name = result.public_id;
                // imagen.url = result.secure_url;
                // imagen.cover = (file.originalname == portada) ? true : false;
                response.imagenes.push(imagen);
            } catch (e) {
                console.error('Cloudinary error: \n');
                console.error(e);
            }
        }); */
        // console.log('End of files loop..');
        // console.log(response);

        // var promises = loopFiles(req.files, []);
        response.imagenes = [];
        _.each(req.files, function (file, i) {
            try {
                var p = cloudinary.uploader.unsigned_upload(file.path, CLOUDINARY_UPLOAD_PRESET);
                promises.push(p);
            } catch (e) {
                console.error('Cloudinary error: \n');
                console.error(e);
            }
        });
        Promise.all(promises).then(results => {
            _.each(req.files, function (file, i) {
                var imagen = {};
                imagen.name = results[i].public_id;
                imagen.url = results[i].secure_url;
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
                    if (evento.id == id) {
                        evento.imagenes = response.imagenes;
                    }
                });
                res.status(200).json(response);
                console.log('There was not any multer error');
                console.log(response);
            }

            // console.log(results);


        }).catch(error => {
            console.log(error);
            delete response.imagenes;
            response.success = false;
            response.msg = 'Hubo un error, intentelo de nuevo';
        });

    });
});


// Obtener imagen del evento
router.get('/:id/images/:name', (req, res) => {
    var id = req.params.id,
        imgName = req.params.name;
    // console.log(req.params.name);
    console.log(`${id} : ${imgName}`);
    var wasFound = false;
    _.each(eventos, (evento, i) => {
        if (evento.id == id) {
            wasFound = true;
        }
    });

    if (wasFound) {
        console.log('Se encontró el evento');
    }

    // console.log('id - ' + id);
    // console.log(req.params);
    // console.log(req.get('Content-type'));
    // console.log(JSON.stringify(req.headers));
    // console.log(req.body.portada);
    var response = {};
    // const { nombre, ciudad, lugar, fecha, hora, descripcion, url, categoria, capacidad, costo } = req.body;
    // const id = eventos.length + 1;
    // const newEvento = { ...req.body, id };
    // console.log(newEvento);
    // res.status(200).json(newEvento);

    /*upload(req, res, (err) => {
        // console.log('req.files');
        // console.log(req.files);
        console.log(req.body.portada);
        var portada = req.body.portada || req.files[0].originalname;
        console.log(portada);
        response.imagenes = [];
        // console.log(req.originalUrl);

        // Generar json de respuesta
        _.each(req.files, (file, i) => {
            var imagen = {};
            console.log('file - ' + (i + 1));
            console.log(file);
            imagen.name = file.filename;
            imagen.url = req.protocol + '://' + req.get('host') + req.originalUrl + '/' + file.filename;
            imagen.cover = (file.originalname == portada) ? true : false;
            response.imagenes.push(imagen);
        });
        console.log(response);
        if (err) {
            console.log('There was an error...');
            console.log(err);
            response.success = false;
        } else {
            response.success = true;
            
            res.status(200).json(response);
            console.log('There was not any error');
            console.log(response);
        }
    });*/
});
module.exports = router;