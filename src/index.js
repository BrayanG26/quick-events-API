const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');

//settings
app.set('port', process.env.PORT || 3000);
app.set('json spaces', 2);
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(cors());

//middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//routes
app.use(require('./routes/index'));
app.use('/api/eventos', require('./routes/eventos'));
app.use('/api/organizadores', require('./routes/organizadores'));

//starting server
app.listen(app.get('port'), () => {
    console.log('server on port 3000');
});