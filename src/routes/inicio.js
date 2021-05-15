/*------------------------ express -----------------------*/
const express = require('express');
const ruta = express.Router(); //Para las rutas
module.exports = ruta; //Para exportar esta función o constante
/*------------------------ express -----------------------*/

/*------------------------ Extras -----------------------*/
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
/*------------------------ Extras -----------------------*/

/*------------------------AWS -----------------------*/
const awsConfig = require('../server/awsConfKey')
var AWS = require('aws-sdk');
AWS.config.update(awsConfig);
const documentClient = new AWS.DynamoDB.DocumentClient();
/*------------------------AWS -----------------------*/

/*-------------------------------------------------------------------- RUTAS LOGIN */

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   lOGIN
ruta.get('/', (req, res) => {
    res.render('login');
});
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   REGISTER

ruta.get('/registrar', (req, res) => {
    res.render('registro');
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   RECUPERAR CONTRASEÑA

ruta.get('/recuperarPass', (req, res) => {
    res.render('forgotPassword');
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   USUARIO INEXISTENTE

ruta.get('/noExiste', (req, res) => {
    res.render('noExisteUser');
});


/*-------------------------------------------------------------------- INTERFACES APLICACIÓN*/
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   PERFIL
ruta.get('/perfil', (req, res) => {
    res.render('profilPage');
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   GESTOR DE AVISOS

ruta.get('/avisosGestion', (req, res) => {
    var params = {
        TableName: "aviso_lc",
        FilterExpression: 'email = :value',
        ExpressionAttributeValues: { ':value': req.session.email }
    };
    documentClient.scan(params, function(err, data) {
        if (err) console.log(err)
        else {
            var avisos = data.Items;
            res.render('avisosGestion', { aviso, avisos });
            aviso = {};
        }
    });

});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   CAPRUTAR AVISO - FORMULARIO
var aviso = {
    "titulo_id": "",
    "descripcion": "",
    "img": "",
    "categoria": "",
    "existente": "true"
};

ruta.get('/obtenetID/:id', (req, res) => {
    var id = req.params.id;
    var params = {
        TableName: "aviso_lc",
        Key: {
            "titulo_id": id,
        }
    };

    documentClient.get(params, function(err, data) {
        if (err) console.log(err);
        else {
            aviso = data.Item;
            res.redirect('/avisosGestion');
        }
    });
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   HISTORIAL 
ruta.get('/historial', (req, res) => {

    var params = {
        TableName: "aviso_lc",
        FilterExpression: 'exist = :value',
        ExpressionAttributeValues: { ':value': "true" }
    };

    documentClient.scan(params, function(err, data) {
        if (err) console.log(err)
        else {
            var avisos = data.Items;
            if (avisos == undefined) avisos = {};
            res.render('historial', { avisos });

        }
    });


});