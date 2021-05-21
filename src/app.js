const express = require('express');
const config = require('./server/config');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');

const app = config(express());


app.listen(app.get('port'), () => {
    console.log("Servidor en el puerto", app.get('port'));
});