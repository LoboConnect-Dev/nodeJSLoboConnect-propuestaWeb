jQuery(document).ready(function($) {
    var alterClass = function() {
        var ww = document.body.clientWidth;
        if (ww < 600) {
            $('#buscar').removeClass('ms-auto'); //Si el tamaño de la pantalla es pequeño, se removerá esta clase
        } else if (ww >= 601) {
            $('#buscar').addClass('ms-auto'); //Si el tamaño de la pantalla es grande, se agregará esta clase
        };
    };
    $(window).resize(function() {
        alterClass();
    });
    //Fire it when the page first loads:
    alterClass();
});