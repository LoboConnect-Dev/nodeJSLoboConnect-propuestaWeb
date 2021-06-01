/*------------------------ express -----------------------*/
const express = require('express');
const ruta = express.Router(); //Para las rutas
module.exports = ruta; //Para exportar esta función o constante
/*------------------------ express -----------------------*/

/*------------------------ Extras -----------------------*/
const { v4: uuidv4 } = require('uuid');
/*------------------------ Extras -----------------------*/
/*------------------------ No usadas -----------------------*/
// const multer = require('multer');
// const ejs = require('ejs');
// const path = require('path');
// const { url } = require('inspector');
// const { Console } = require('console');
/*------------------------ No usadas -----------------------*/
/*------------------------AWS -----------------------*/
const awsConfig = require('../server/awsConfKey')
var AWS = require('aws-sdk');

AWS.config.update(awsConfig);
const documentClient = new AWS.DynamoDB.DocumentClient();
/*------------------------AWS -----------------------*/


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ FECHA ACTUAL CON FORMATO MM/DD/AAA
var currentDate = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
}).toString();
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ FECHA ACTUAL CON FORMATO MM/DD/AAA

ruta.post('/altaAviso', (req, res) => {

    if (req.session.email && req.session.password) {
        var { id, titulo, descripcion } = req.body;
        console.log(req.body);
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
                "fechaModificacion": currentDate,
                "fechaPublicacion": currentDate,
                "fechaParaOrdenar": new Date().toString(),
                "titulo": titulo,
                "descripcion": descripcion,
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
                UpdateExpression: "set #fechaModi= :fecha, #titulo= :titulo ,#descripcion= :descripcion",
                ExpressionAttributeValues: {
                    ":fecha": currentDate,
                    ":titulo": titulo,
                    ":descripcion": descripcion,
                },
                ExpressionAttributeNames: {
                    "#fechaModi": "fechaModificacion",
                    "#titulo": "titulo",
                    "#descripcion": "descripcion",
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
    } else {
        res.redirect('/')
    }
});



/*-------------------------------------------------------------------- RUTAS */
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ MODULO MULTER PARA SUBIR IMAGENES AL SERVIDOR
// Set The Storage Engine
// const storage = multer.diskStorage({
//     destination: './src/public/assets/img/uploads/',
//     filename: function(req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     }
// });

// // Init Upload
// const upload = multer({
//     storage: storage,
//     limits: { fileSize: 1000000 },
//     fileFilter: function(req, file, cb) {
//         checkFileType(file, cb);
//     }
// }).single('myImage');

// // Check File Type
// function checkFileType(file, cb) {
//     // Allowed ext
//     const filetypes = /jpeg|jpg|png|gif/;
//     // Check ext
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     // Check mime
//     const mimetype = filetypes.test(file.mimetype);

//     if (mimetype && extname) {
//         return cb(null, true);
//     } else {
//         cb('Error: Solo se permiten imagenes con formatos "jpeg, jpg, png, gif" ');
//     }
// }


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ REGISTRAR AVISOS  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@QQQ
//--------------------------------SUBIR IMAGENES AL SERVIDOR----------------------------
// var urlImg = "";
// ruta.post('/uploads', (req, res) => {

//     if (req.session.email && req.session.password) {
//         upload(req, res, (err) => {
//             if (err) {
//                 res.render('imagenex', {
//                     msg: err
//                 });
//             } else {
//                 if (req.file == undefined) {
//                     res.render('imagenex', {
//                         msg: 'Error: No File Selected!'
//                     });
//                 } else {
//                     res.render('imagenex', {
//                         msg: 'File Uploaded!',
//                         file: `./../assets/img/uploads/${req.file.filename}`
//                     });
//                     urlImg = `assets/img/uploads/${req.file.filename}`;
//                     console.log(urlImg);
//                 }
//             }
//         });

//     } else {
//         res.redirect('/')
//     }

// });
// // ------------------------------DAR DE ALTA LOS AVISOS----------------------