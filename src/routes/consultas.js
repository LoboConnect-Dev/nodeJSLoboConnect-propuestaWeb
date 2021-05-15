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

/*-------------------------------------------------------------------- RUTAS */

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ REGISTRAR AVISOS

ruta.post('/altaAviso', (req, res) => {
    var { id, titulo, descripcion, img, categoria, lapso } = req.body;
    var email = req.session.email;
    var nombre = req.session.nombre;
    var departamento = req.session.departamento;

    if (id.length <= 0) id = uuidv4();

    var params = {
        TableName: "aviso_lc",
        Key: {
            "titulo_id": id,
        }
    };

    documentClient.get(params, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            if (data.Item === undefined) {
                insertaNuevoAviso();
            } else {
                actualizaAviso();
            }
        }
    });

    let insertaNuevoAviso = function() {
        var object = {
            "titulo_id": uuidv4(),
            "fecha": new Date().toString(),
            "titulo": titulo,
            "descripcion": descripcion,
            "img": img,
            "categoria": categoria,
            "lapso": lapso,
            "exist": "true",
            "email": email,
            "usuario": nombre,
            "departamento": departamento
        };
        const params = {
            TableName: "aviso_lc",
            Item: object
        };
        documentClient.put(params, function(err, data) {
            if (!err) {
                console.log("Guardado correctamente");
                res.redirect('/avisosGestion');
            } else {
                console.log("Error siguiente: ", err);
            }
        });
    }

    let actualizaAviso = function() {
        const params = {
            TableName: "aviso_lc",
            Key: {
                "titulo_id": id,
            },
            UpdateExpression: "set #fecha= :fecha, #titulo= :titulo ,#descripcion= :descripcion, #img= :img, #categoria= :categoria, #lapso= :lapso",
            ExpressionAttributeValues: {
                ":fecha": new Date().toString(),
                ":titulo": titulo,
                ":descripcion": descripcion,
                ":img": img,
                ":categoria": categoria,
                ":lapso": lapso,
            },
            ExpressionAttributeNames: {
                "#fecha": "fecha",
                "#titulo": "titulo",
                "#descripcion": "descripcion",
                "#img": "img",
                "#categoria": "categoria",
                "#lapso": "lapso",
            },
            ReturnValues: "UPDATED_NEW"
        };

        documentClient.update(params, function(err, data) {
            if (err) {
                console.log("Error siguiente: ", err);
            } else {
                console.log("Actualizado correctamente ", data);
                res.redirect('/avisosGestion');
            }
        });

    }
});