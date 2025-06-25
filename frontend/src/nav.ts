import { initProfilePage } from './profile'
import { getFriends } from "./friends"
import { moveBall } from "./pongballeffects"
import { updateConnectionStatus } from './status'
import { showToast } from './showToast'
import { EventManager } from './eventManager';
import { initializeLanguageSwitcher } from './i18n';
import { updateTexts } from './i18n'
import './i18n';


export const onNavigate = new EventManager();

export async function navigate(page : string) {
    try {
		onNavigate.dispatch();
		window.history.replaceState(null, document.title, page);
		const response = await fetch(`../pages/${page}.html`);
        if (!response.ok) throw new Error("Page not found");
        const html = await response.text();
        const elem = document.getElementById('screen-content');
        if (elem)
            elem.innerHTML = html;
        
        // Initialiser i18n après le chargement du nouveau contenu
        setTimeout(() => {
            updateTexts();
            initializeLanguageSwitcher();
        }, 50);
        
        if (page === "profile") {
            await updateConnectionStatus(1);
            await initProfilePage();
        } else if (page === "friends") {
            await getFriends();
        }
        
        moveBall();
        
    } catch (error) {
        console.error("Erreur de chargement :", error);
        const elem = document.getElementById('screen-content');
        if (elem)
            elem.innerHTML = "<p>404 - QUITTE LA PAGE VITE!</p>";
    }
}

export async function user_exist(username: string): Promise<boolean> {
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
            //alert(data.message || 'Erreur lors de l'inscription.');
            return (false);
        }
    } catch (err) {
        console.error('Erreur fetch:', err);
        showToast('Erreur serveur', 'error');
        return (false);
    }
}

async function default_navigate() {
    const username = localStorage.getItem("username");
    if (localStorage.getItem('isConnected') === 'true' && (username && await user_exist(username) === true)) {
        await navigate("win");
    } else {
        localStorage.removeItem("isConnected");
        localStorage.removeItem("username");
        localStorage.removeItem("email");
        localStorage.removeItem("token");
        await navigate("log");
    }
}

default_navigate();
(window as any).navigate = navigate;
(window as any).default_navigate = default_navigate;