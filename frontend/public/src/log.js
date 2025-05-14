// import { setCookie } from 'typescript-cookie';
async function connect(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            localStorage.setItem('username', username);
            localStorage.setItem('isConnected', 'true');
        }
        else {
            alert(data.message || 'Erreur lors de la connexion.');
        }
    }
    catch (err) {
        console.error('Erreur fetch:', err);
        alert('Erreur serveur');
    }
}
;
// Expose function to global scope
window.connect = connect;
window.addEventListener('DOMContentLoaded', () => {
    const connectBtn = document.getElementById('connect-button');
    if (connectBtn) {
        connectBtn.addEventListener('click', connect);
    }
});
export {};
