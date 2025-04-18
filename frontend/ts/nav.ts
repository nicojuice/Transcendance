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

// Expose function to global scope
(window as any).navigate = navigate;
