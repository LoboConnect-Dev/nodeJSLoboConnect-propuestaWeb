jQuery(document).ready(function($) {
    var alterClass = function() {
        var ww = document.body.clientWidth;
        if (ww < 600) {
            $('.fas.fa-bell').removeClass('displayCenter'); //Si el tamaño de la pantalla es pequeño, se removerá esta clase
            $('.col-md-3').removeClass('displayCenter');
        } else if (ww >= 601) {
            $('.fas.fa-bell').addClass('displayCenter'); //Si el tamaño de la pantalla es grande, se agregará esta clase
            $('.col-md-3').addClass('displayCenter');
        };
    };
    $(window).resize(function() {
        alterClass();
    });
    //Fire it when the page first loads:
    alterClass();
});