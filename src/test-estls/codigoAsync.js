//Código no bloqueante
//Este es código asyncrono, es decir que se ejecuta, sin embargo, todo el demás flujo
//de código se sigue ejecutando. Esta función no necesita ser terminada para
// ejecutar lo demás

//Este es un método que no es tarea de NodeJS
query('SELECT * FROM USERS', function(err, users) {
    if (err) {} else return users;
});