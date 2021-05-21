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
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
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

    var profile = {
        "name": req.session.nombre,
        "email": req.session.email,
        "depa": req.session.departamento,
    }

    res.render('profilPage', { profile });
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

ruta.get('/obtenerID/:id', (req, res) => {
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
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ SUBIR IMAGEN AL SERVIDOR

ruta.get('/imagen', (req, res) => {
    res.render('imagenex');
});

/*---------------------------------------------------------- ELIMINAR PRODUCTOS -------------------------- */
ruta.get('/eliminar/:id', (req, res) => {

    var id = req.params.id;
    console.log(id);

    const params = {
        TableName: "aviso_lc",
        Key: {
            "titulo_id": id,
        }
    };
    documentClient.delete(params, function(err, data) {
        if (err) {
            console.log("Ocurrió un error", err);
        } else {
            console.log("Eliminado correctamente ", data);
            res.redirect('/avisosGestion');
        }
    });
});


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ NOTIFICAR DE UN CAMBIO PARA ALGUN AVISO

var aviso = {};
ruta.get('/notify/:id', (req, res) => {
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
            res.redirect('/crearNotify');
        }
    });
});

ruta.get('/crearNotify', (req, res) => {
    res.render('crearNotificacion', { aviso });
});


ruta.post('/nuevaNotificacion', (req, res) => {
    var { id_aviso, correoDePropietario, comentario } = req.body;

    var nombre = req.session.nombre;
    var departamento = req.session.departamento;
    var object = {
        "id_notificación": uuidv4(),
        "id_aviso": id_aviso,
        "usuarioPropietario": correoDePropietario,
        "usuariONotificador": nombre,
        "departamentoNotificador": departamento,
        "comentario": comentario,
    };
    const params = {
        TableName: "notify_lc",
        Item: object
    };
    documentClient.put(params, function(err, data) {
        if (!err) {
            console.log("Guardado correctamente");
            res.redirect('/historial');
        } else {
            console.log("Error siguiente: ", err);
        }
    });


});