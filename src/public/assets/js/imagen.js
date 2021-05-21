
$(document).ready(function(){
 0
    $("#btnImg").click(function(event) {
      /*Evita que se recargue la página*/
      event.preventDefault();
      /* Serializamos en una sola variable ambos formularios*/
      var allData = $("#aviso-capturar, #imagenex").serialize();
      /*Prueba*/
      console.log(allData);
      alert(allData);

      //CONST DATOS
      /*Podemos usar allData para enviarlo por Ajax o lo que sea*/
      allData
    });
});