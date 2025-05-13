async function register(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const username = usernameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    if (password !== confirmPassword) {
        alert("Les mots de passe ne correspondent pas.");
        return;
    }
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            window.location.href = './index.html';
        }
        else {
            alert(data.message || 'Erreur lors de l’inscription.');
        }
    }
    catch (err) {
        console.error('Erreur fetch:', err);
        alert('Erreur serveur');
    }
}
;
// Expose function to global scope
window.register = register;
window.addEventListener('DOMContentLoaded', () => {
    const registerBtn = document.getElementById('register-button');
    if (registerBtn) {
        registerBtn.addEventListener('click', register);
    }
});
export {};
