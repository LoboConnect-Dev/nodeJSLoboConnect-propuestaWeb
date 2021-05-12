const express = require('express');
const ruta = express.Router(); //Para las rutas
module.exports = ruta; //Para exportar esta función o constante


/* INICIO DE SESIÓN - PRIMERAS PÁGINAS ----------------------------------- */
ruta.get('/', (req, res) => {
    res.render('login');
});
ruta.get('/registrar', (req, res) => {
    res.render('registro');
});

/* VERIFICACIÓN  DE INICIO DE SESIÓN DE USUARIO EN BASE DE DATOS ---------- */
ruta.get('/verificarLogueo', (req, res) => {
    res.redirect('/avisosGestion');
});

// GESTIONADOR DE AVISOS
ruta.get('/avisos', (req, res) => {
    res.render('avisosGestion');
});
ruta.get('/avisosGestion', (req, res) => {
    res.render('avisosGestion');
});