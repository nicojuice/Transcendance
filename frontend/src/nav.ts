async function navigate(page: string) {
  try {
    const response = await fetch(`/pages/${page}.html`);
    if (!response.ok)
      throw new Error('404');
    const html = await response.text();
    document.getElementById('content')!.innerHTML = html;
  } catch {
    const res404 = await fetch('/pages/404.html');
    const html404 = await res404.text();
    document.getElementById('content')!.innerHTML = html404;
  }

  history.pushState(null, '', `#${page}`);
}

window.addEventListener('load', () => {
  const page = location.hash.replace('#', '') || 'home';
  navigate(page);
});

window.addEventListener('popstate', () => {
  const page = location.hash.replace('#', '') || 'home';
  navigate(page);
});

const neonText = document.getElementById('div-neon');
if (neonText)
{
  let intensity = 0.8;
  let direction = 1;
  let baseBlur = 10;
  let hover = false;

  neonText.addEventListener('mouseenter', () => console.log('mouse enter div'));
  neonText.addEventListener('mouseleave', () => console.log('mouse leave div'));

  setInterval(() => {
    intensity *= 0.01 * direction;
    if (intensity >= 1 || intensity <= 0.6)
      direction *= -1;

    // Si hover, augmenter la taille du glow
    const blurMultiplier = hover ? 2 : 1;
    const blur10 = baseBlur * blurMultiplier;
    const blur20 = (baseBlur * 2) * blurMultiplier;
    const blur30 = (baseBlur * 3) * blurMultiplier;
    console.log('test');
    neonText.style.textShadow = `
      0 0 ${blur10}px rgba(234,179,8,${intensity}),
      0 0 ${blur20}px rgba(234,179,8,${intensity}),
      0 0 ${blur30}px rgba(234,179,8,${intensity})`;
  }, 50);
}

// Expose function to global scope
(window as any).navigate = navigate;