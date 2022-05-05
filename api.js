const express = require('express');
const path = require('path');

const api = express();

api.use('/', express.static('index.html'));

api.use(express.static(path.join(__dirname, 'public')));

module.exports = api;