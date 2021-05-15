const path = require('path');
const session = require('express-session');
const express = require('express');

//Carpetas de rutas
const usuarios = require('../routes/inicio');
const sesionUser = require('../routes/sesion');
const consultas = require('../routes/consultas');


module.exports = app => {

    //Settings
    app.set('port', process.env.PORT || 3000);

    app.use(session({
        secret: "inidbprod",
        resave: true, //Que la sesion se gurade cada que haya un cambio
        saveUninitialized: true //Que se guarde aun cuando no se haya inicializadp la variable de sesión
    }));

    //Motor de vistas
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));

    //Carpeta estática
    app.use('/', express.static(path.join(__dirname, '../public')));
    app.use('/sesion', express.static(path.join(__dirname, '../public')));
    app.use(express.urlencoded({ extended: true })); //Para recibir datos del formulario

    //Rutas
    app.use('/', usuarios);
    app.use('/sesion', sesionUser);
    app.use('/consultas', consultas);



    return app;
}