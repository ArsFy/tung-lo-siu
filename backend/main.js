const express = require('express');
const app = express();
const multipartMiddleware = require('connect-multiparty')();
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const api = require('./api');
const config = require('./config');

// Setting
app.disable('x-powered-by');
// Use
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());

// Status
app.get('/api/status', multipartMiddleware, (req, res) => {
    res.json({ "status": 200 });
});

// Static
app.use('/', express.static('static'));
app.use('/image', express.static(config.image));

// API
app.post("/api/list", multipartMiddleware, api.list);

// 404
app.get('*', (req, res) => {
    res.status(404).json({ "status": 404 });
});
app.post('*', (req, res) => {
    res.status(404).json({ "status": 404 });
});
// 500
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({ "status": 500 });
});

// listen
app.listen(config.http_port || 80, () => {
    console.log("Start Web...")
})