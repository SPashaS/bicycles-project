// IBG
function ibg(){
    let ibg=document.querySelectorAll("._ibg");
    
    for (var i = 0; i < ibg.length; i++) {
        if(ibg[i].querySelector('img')){
            ibg[i].style.backgroundImage = 'url('+ibg[i].querySelector('img').getAttribute('src')+')';
        }
    }
}
ibg();


// MENU
function menuBurger() {
    let menuIcon = document.querySelector('.icon__menu');
    let menuBody = document.querySelector('.menu__body');

    menuIcon.addEventListener('click', function() {
        menuBody.classList.toggle('menu__body--active')
        menuIcon.classList.toggle('icon__menu--active')
    })
}
menuBurger();

//# sourceMappingURL=script.js.map
