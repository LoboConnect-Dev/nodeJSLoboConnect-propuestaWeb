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

/*------------------------ Mensajes -----------------------*/

/*-------------------------------------------------------------------- RUTAS */
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  EXIT

ruta.get('/exit', (req, res) => {
    req.session.destroy();
    res.redirect('/')
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  INICIAR SESION 

/*------------------------ Mensajes -----------------------*/
var advetenciaInexis = {
    "titulo": "Usuario",
    "user": " ",
    "descripcion": "Inexistente"
}
var advetenciaExis = {
    "titulo": "Usuario",
    "user": " ",
    "descripcion": "Existente"
}
var advetenciaPassIncorrect = {
    "titulo": "Contraseña",
    "user": " ",
    "descripcion": "Incorrecta"
}

ruta.post('/verificarLogueo', (req, res) => {

    let { username, password } = req.body;

    if (username.length > 0 && password.length > 0) {
        const params = {
            TableName: "users_lc",
            Key: {
                "email_id": username,
            }
        };

        documentClient.get(params, function(err, data) {
            if (err) {
                advetenciaInexis.user = username;
                res.render('mensaje', { advertencia: advetenciaInexis });
                console.log(err);
            } else {
                if (data.Item) {
                    verificarPassword(data.Item.pass);

                } else {
                    advetenciaInexis.user = username;
                    res.render('mensaje', { advertencia: advetenciaInexis });
                }
            }
        });

        let verificarPassword = function(dataPass, dataUser) {
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
                            res.render('mensaje', { advertencia: advetenciaPassIncorrect });
                            console.log(err);
                        } else {
                            req.session.email = data.Item.email_id;
                            req.session.nombre = data.Item.usuario;
                            req.session.departamento = data.Item.departamento;
                            req.session.password = data.Item.pass;
                            res.redirect('/avisosGestion');
                        }
                    });
                } else {
                    res.render('mensaje', { advertencia: advetenciaPassIncorrect });
                    console.log(err);
                }
            });
        }
    } else {
        advetenciaInexis.user = "";
        res.render('mensaje', { advertencia: advetenciaInexis });
    }
});


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ CAMBIAR CONTRASEÑA


ruta.get('/cambiarPass', (req, res) => {
    res.render('changePassword');
});

ruta.post('/changePass', (req, res) => {
    var { actualPassword, newpassword } = req.body;

    if (req.session.email && req.session.password) {
        bcrypt.compare(actualPassword, req.session.password, function(err, isValid) {
            if (isValid) {
                modifiPass(req.session.email);
            } else {
                res.redirect('/modificarPasswordError')
            }
        });

        let modifiPass = function(user_email) {
            var passNew = newpassword;
            req.session.password = passNew;

            const salt = 10;
            const hash = bcrypt.hashSync(passNew, salt);
            var passNew = hash;

            const params = {
                TableName: "users_lc",
                Key: {
                    "email_id": user_email,
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
                    res.redirect('/perfil');
                }
            });
        }
    }
});
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ REGISTRAR NUEVO USUARIO

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
        if (err) {
            console.log(err);
        } else {
            console.log(data.Item);
            if (data.Item === undefined) {
                insertaAlUsuario();
            } else {
                advetenciaExis.user = username;
                res.render('mensaje', { advertencia: advetenciaExis });
            }
        }
    });

    let insertaAlUsuario = function() {
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
                console.log("Guardado correctamente");
                res.redirect('/');
            } else {
                console.log("Error siguiente: ", err);
            }
        });
    }
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  CAMBIAR CONTRASEÑA


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
            advetenciaInexis.user = username;
            res.render('mensaje', { advertencia: advetenciaInexis });
            console.log(err);
        } else {
            if (data.Item) {
                nuevaContraseña(data.Item.email_id);
            } else {
                advetenciaInexis.user = username;
                res.render('mensaje', { advertencia: advetenciaInexis });
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
                pass: 'ouifrdsbfkonhxaj' //'1q2w3e1q' // Remplazar con nustras credenciales o con la contraseña especifica de la aplciación
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