import { initProfilePage } from './profile';

export async function	navigate(page : string) {
    try {
		const response = await fetch(`../pages/${page}.html`);
        if (!response.ok) throw new Error("Page not found");
        const html = await response.text();
		const elem = document.getElementById('screen-content');
		if (elem)
        	elem.innerHTML = html;
		if (page === "profile")
			initProfilePage();
    } catch (error) {
        console.error("Erreur de chargement :", error);
        		const elem = document.getElementById('screen-content'); 
		if (elem)
        	elem.innerHTML = "<p>QUITTE LA PAGE VITE!</p>";
    }
}

export async function user_exist(username: string) : Promise<boolean> {
	// check si le username est valide et correspond a un utilisateur existant
	if (!username)
		return (false);
	try {
		const response = await fetch(`http://localhost:8081/api/backend/user_exist?username=${encodeURIComponent(username)}`, {
			method: 'GET'
		});
		//const data = await response.json();
		if (response.ok) {
			//alert(data.message);
			return (true);
		} else {
			//alert(data.message || 'Erreur lors de l’inscription.');
			return (false);
		}
	} catch (err) {
		console.error('Erreur fetch:', err);
		alert('Erreur serveur');
		return (false);
	}
}

async function default_navigate() {
	if (localStorage.getItem('isConnected') === 'true')
	{
		const username = localStorage.getItem("username");
		if (username && await user_exist(username) === true)
			await navigate("profile");
		else
		{
			localStorage.removeItem("isConnected");
			localStorage.removeItem("username");
			await navigate("log");
		}
	}
	else
	{
		await navigate("log");
	}
}

	default_navigate();
	(window as any).navigate = navigate;
	(window as any).default_navigate = default_navigate;
	
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