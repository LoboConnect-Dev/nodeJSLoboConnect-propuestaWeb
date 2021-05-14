const express = require('express');
const ruta = express.Router(); //Para las rutas
module.exports = ruta; //Para exportar esta función o constante
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
module.exports = ruta;

/*------------------------AWS -----------------------*/
var AWS = require('aws-sdk');
// const config = require('../config/config.js');
// AWS.config.update(config.aws_local_config);

let awsConfig = {
    "region": "us-east-2",
    "endpoint": "http://dynamodb.us-east-2.amazonaws.com",
    "accessKeyId": "AKIAWIADP6EPCQHBXCWW",
    "secretAccessKey": "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"
};
AWS.config.update(awsConfig);

const documentClient = new AWS.DynamoDB.DocumentClient();

/* FORMULARIO DE INICIO DE SESIÓN - PRIMERAS PÁGINAS ----------------------------------- */
ruta.get('/', (req, res) => {
    res.render('login');
});
ruta.get('/registrar', (req, res) => {
    res.render('registro');
});

ruta.get('/noExiste', (req, res) => {
    res.render('noExisteUser');
});

/* VERIFICACIÓN  DE INICIO DE SESIÓN DE USUARIO EN BASE DE DATOS ---------- */
ruta.get('/verificarLogueo', (req, res) => {
    res.redirect('/avisosGestion');
});

// GESTIONADOR DE AVISOS
ruta.get('/avisos', (req, res) => {
    res.render('avisosGestion');
});

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

var aviso = {
    "titulo_id": "",
    "descripcion": "",
    "img": "",
    "categoria": "",
    "existente": "true"
};
ruta.get('/avisosGestion', (req, res) => {

    var params = {
        TableName: "aviso_lc",
        FilterExpression: 'existente = :value',
        ExpressionAttributeValues: { ':value': "true" }
    };

    documentClient.scan(params, function(err, data) {
        if (err) console.log(err)
        else {
            var avisos = data.Items;
            console.log(avisos);
            res.render('avisosGestion', { aviso, avisos });

        }
    });
    // aviso = {}


});

//RECUPERAR CONTRASEÑA
ruta.get('/recuperarPass', (req, res) => {
    res.render('forgotPassword');
});


/* PERFIL DEL USUARIO ------------------------------------------------- */
//PRUEBA PERFIL
ruta.get('/profil', (req, res) => {
    res.render('profilPage');
});

ruta.get('/recuperarPass', (req, res) => {
    res.render('recoveryPass');
});

ruta.get('/verificarAdmin', (req, res) => {
    res.render('verificarAdmin');
});

/* PÁGINAS DE LA APLICACIÓN ------------------------------------- */
// Historial

ruta.get('/historial', (req, res) => {
    res.render('historial');
});

// -----------------------------------------------------------------------------
/*---------------------------------------------------------- REGISTRAR USUARIOS -------------------------- */
/*------------------------------- REGISTRAR Y VERIFICAR QUE NO EXISTA OTRO IGUAL*/

ruta.post('/register', (req, res) => {
    var { email, username, password, departamento } = req.body;

    const salt = 10;
    const hash = bcrypt.hashSync(password, salt);
    var password = hash;

    console.log("Contraseña registrada: " + password)

    const params = {
        TableName: "users_lc",
        Key: {
            "email_id": email,
        }
    };

    documentClient.get(params, function(err, data) {
        if (err) console.log(err);
        else {
            console.log(data.Item);
            if (data.Item === undefined) {
                inserta();
            } else {
                res.render('userExist', { username: email });
            }
        }
    });

    let inserta = function() {
        var object = {
            "email_id": email,
            "usuario": username,
            "pass": password,
            "departamento": departamento,
        };
        const params = {
            TableName: "users_lc",
            Item: object
        };
        documentClient.put(params, function(err, data) {
            if (!err) {
                console.log("Guardado correctamente", data);
                res.redirect('/');
            } else {
                console.log("Error siguiente: ", err);
            }
        });
    }
});

/*---------------------------------------------------------- INICIAR SESION -------------------------- */

ruta.post('/verificarLogueo', (req, res) => {
    var { username, password } = req.body;

    console.log("Login de pass:" + password)
    const params = {
        TableName: "users_lc",
        Key: {
            "email_id": username,
        }
    };

    documentClient.get(params, function(err, data) {
        if (err) {

            res.send('No existe usuario');
            console.log(err);
        } else {
            if (data.Item) {
                passVeri(data.Item.pass);
            } else {
                res.render('noExiste');
            }

        }
    });

    let passVeri = function(dataPass) {
        bcrypt.compare(password, dataPass, function(err, isValid) {
            if (isValid) {
                const params = {
                    TableName: "users_lc",
                    Key: {
                        "email_id": username,
                    }
                };
                documentClient.get(params, function(err, data) {
                    if (err) {
                        res.send('No existe usuario');
                        console.log(err);
                    } else {
                        /* req.session.usuario = data.Item.email_id;
                         req.session.nombre = data.Item.usuario;
                         req.session.password = data.Item.pass;
                         req.session.user_type = data.Item.user_type;*/
                        res.redirect('/avisosGestion');
                    }
                });
            } else {
                console.log("Error")
                res.render('noExiste');
            }
        })
    }
});

/*---------------------------------------------------------- ENVIAR PASS NUEVA A CORREO ----------------------------------------- */

ruta.post('/cambiarPass', (req, res) => {
    var user_search = req.body.email;
    var email = req.body.email;

    console.log("correo a enviar contraseña nueva " + user_search)
    const params = {
        TableName: "users_lc",
        Key: {
            "email_id": user_search,
        }
    };

    documentClient.get(params, function(err, data) {
        if (err) {
            res.send('No existe usuario');
            console.log(err);
        } else {
            if (data.Item) {
                nuevaContraseña(data.Item.email_id);
            } else {
                res.send('errror');
            }
        }
    });

    let nuevaContraseña = function(user_check) {
        var passNew = uuidv4();
        var passChanged = passNew;
        const salt = 10;
        const hash = bcrypt.hashSync(passNew, salt);
        var passNew = hash;
        const params = {
            TableName: "users_lc",
            Key: {
                "email_id": user_check,
            },
            UpdateExpression: "set #password= :newPassword",
            ExpressionAttributeValues: {
                ":newPassword": passNew,
            },
            ExpressionAttributeNames: {
                "#password": "pass",
            },
            ReturnValues: "UPDATED_NEW"
        };

        documentClient.update(params, function(err, data) {
            if (err) {
                console.log("Error siguiente: ", err);
            } else {
                enviarCorreo(passChanged);
                res.redirect('/');
            }
        });
    }

    let enviarCorreo = function(passN) {
        const cuerpo = "Su contraseña ha sido reescrita \n Esta es una contraseña temporal con la cual puede ingresar ahora: " + passN + "\nLe recomendamos modificarla en cuanto tenga la oportunidad";


        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'sisgeinn2@gmail.com',
                pass: 'ouifrdsbfkonhxaj' //'1q2w3e1q' // naturally, replace both with your real credentials or an application-specific password
            }
        });

        const mailOptions = {
            to: email,
            subject: "Cambio de contraseña",
            text: cuerpo
        };

        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
});

/*---------------------------------------------------------- REGISTRAR AVISOS -------------------------- */

ruta.post('/altaAviso', (req, res) => {
    var { titulo, descripcion, img, categoria } = req.body;
    const params = {
        TableName: "aviso_lc",
        Key: {
            "titulo_id": titulo,
        }
    };

    documentClient.get(params, function(err, data) {
        if (err) console.log(err);
        else {
            console.log(data.Item);
            if (data.Item === undefined) {
                inserta();
            } else {
                res.send('Ya existe un aviso con ese titulo');
            }
        }
    });

    let inserta = function() {
        var object = {
            "titulo_id": titulo,
            "descripcion": descripcion,
            "img": img,
            "categoria": categoria,
            "existente": "true"
        };
        const params = {
            TableName: "aviso_lc",
            Item: object
        };
        documentClient.put(params, function(err, data) {
            if (!err) {
                console.log("Guardado correctamente", data);
                res.redirect('/avisosGestion');
            } else {
                console.log("Error siguiente: ", err);
            }
        });
    }
});