(() => {
    const lines = Array.isArray(window.SAMOFOT_HERO_LINES) ? window.SAMOFOT_HERO_LINES : [];
    const target = document.getElementById('hero-line');

    if (!target || lines.length < 2) {
        return;
    }

    let index = 0;
    setInterval(() => {
        index = (index + 1) % lines.length;
        target.style.opacity = '0.15';

        setTimeout(() => {
            target.textContent = lines[index];
            target.style.opacity = '1';
        }, 220);
    }, 4300);
})();
