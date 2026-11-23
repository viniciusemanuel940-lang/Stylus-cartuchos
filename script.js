const logo = document.querySelector('.logo');

const ESCALA_MAXIMA = 1.4;
const DISTANCIA = 400;

function atualizarLogo() {
    const progresso = Math.min(window.scrollY / DISTANCIA, 1);
    const escala = 1 + progresso * (ESCALA_MAXIMA - 1);

    logo.style.transform = `scale(${escala})`;
}

window.addEventListener('scroll', atualizarLogo);

atualizarLogo();