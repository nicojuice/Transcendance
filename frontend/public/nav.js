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
function navigate(page) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`/pages/${page}.html`);
            if (!response.ok)
                throw new Error('404');
            const html = yield response.text();
            document.getElementById('content').innerHTML = html;
        }
        catch (_a) {
            const res404 = yield fetch('/pages/404.html');
            const html404 = yield res404.text();
            document.getElementById('content').innerHTML = html404;
        }
        history.pushState(null, '', `#${page}`);
    });
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
window.navigate = navigate;
