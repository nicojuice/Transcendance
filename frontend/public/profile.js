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
function get_username() {
    return ("");
}
function change_username(e) {
    return __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        const username = document.getElementById('own_username').value;
        const password = document.getElementById('own_password').value;
        try {
            const response = yield fetch('/api/user-management/su', {
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
