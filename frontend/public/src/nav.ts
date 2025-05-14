async function	navigate(page : string) {
    try {
        const response = await fetch(`../pages/${page}.html`);
        if (!response.ok) throw new Error("Page not found");
        const html = await response.text();
		const elem = document.getElementById('screen-content'); 
		if (elem)
        	elem.innerHTML = html;
    } catch (error) {
        console.error("Erreur de chargement :", error);
        		const elem = document.getElementById('screen-content'); 
		if (elem)
        	elem.innerHTML = "<p>QUITTE LA PAGE VITE!</p>";
    }
}


// async function navigate(page: string) {
//   console.log(page);
//   try {
//     const response = await fetch(`../pages/${page}.html`);
//     if (!response.ok)
//       throw new Error('404');
//     const html = await response.text();
//     document.getElementById('content')!.innerHTML = html;
//   } catch {
//     const res404 = await fetch('/pages/404.html');
//     const html404 = await res404.text();
//     document.getElementById('content')!.innerHTML = html404;
//   }

//   history.pushState(null, '', `#${page}`);
// }


async function default_navigate() {
	if (localStorage.getItem('isConnected') === 'true')
	{
		// await navigate("../pages/profil.html");
	}
  else
    await navigate("log");
}

default_navigate();

(window as any).navigate = navigate;
(window as any).default_navigate = default_navigate;