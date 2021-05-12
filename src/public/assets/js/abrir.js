const contenido = document.querySelector('.contenido');
const opnMenu = document.querySelector('#opnMenu');

//Agrega y quita la clase abrir, cada que se hace click en las barras del menú
opnMenu.addEventListener('click', () => {
    contenido.classList.toggle('abrir');
});