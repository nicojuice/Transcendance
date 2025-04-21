"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function register(e) {
    return __awaiter(this, void 0, void 0, function* () {
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
        alert("Merci!");
        try {
            const response = yield fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = yield response.json();
            if (response.ok) {
                alert(data.message);
                window.location.href = '/index.html';
            }
            else {
                alert(data.message || 'Erreur lors de l’inscription.');
            }
        }
        catch (err) {
            console.error('Erreur fetch:', err);
            alert('Erreur serveur');
        }
    });
}
;
function connect(e) {
    return __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        alert("le serveur va comparer");
        try {
            const response = yield fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = yield response.json();
            if (response.ok) {
                alert(data.message);
                window.location.href = '/gg.html';
            }
            else {
                alert(data.message || 'Erreur lors de la connexion.');
            }
        }
        catch (err) {
            console.error('Erreur fetch:', err);
            alert('Erreur serveur');
        }
    });
}
;
// Expose function to global scope
window.register = register;
