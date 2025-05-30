import { navigate } from "./nav"

export async function send2FACode(username: string, e: Event) : Promise<void> {
	e.preventDefault();

	// send 2FA code
	await navigate('2FAcode');
	const response = await fetch('http://localhost:8100/api/send-2fa-code', {
		method: "POST",
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username })
	});
	if (!response.ok)
	{
		alert("Error while sending the 2FA code.");
		return ;
	}
}

async function active2FAlater(e: Event) : Promise<void> {
	e.preventDefault();

	localStorage.setItem('isConnected', "true");
	await navigate("profile");
}

async function resend2FACode(e: Event) : Promise<void> {
	e.preventDefault();

	const username = localStorage.getItem("username");
	if (!username)
	{
		navigate("log");
		return;
	}
	send2FACode(username, e);
}

async function check2FACode(e: Event) : Promise<void> {
	e.preventDefault();

	const username = localStorage.getItem("username");
	if (!username)
	{
		navigate("log");
		return;
	}
	const code = (document.getElementById('2FA-code') as HTMLInputElement).value;
	const response = await fetch('http://localhost:8100/api/verify-2fa', {
		method: "POST",
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, code })
	});
	if (!response.ok)
	{
		if (response.status === 401)
			alert("Mauvais code");
		else
			alert(`Erreur interne - code ${response.status}`);
	}
	else if ((await response.json()).success === true)
		navigate("profile");
	else
		alert("Mauvais code");
}

export async function is2FA(e: Event) : Promise<Boolean | null> {
	e.preventDefault();

	const username = localStorage.getItem("username");
	if (!username)
	{
		alert("Connexion perdue");
		navigate("log");
		return (null);
	}

	const response = await fetch(`http://localhost:8100/api/is-2fa-active/${encodeURIComponent(username)}`, {
      method: "GET"
    });
	if (!response.ok)
	{
		alert("Erreur serveur");
		return (false);
	}
	const boolean = (await response.json()).enabled;
	//if (boolean === false)
		//alert("false");
	//else if (boolean === true)
		//alert("true");
	return (boolean);
}

async function active2FA(e: Event) : Promise<void> {
	e.preventDefault();

	const username = localStorage.getItem("username");
	if (!username)
	{
		alert("Connexion perdue");
		navigate("log");
		return;
	}

	const response = await fetch('http://localhost:8100/api/active-2fa', {
		method: "POST",
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username })
	});
	if (!response.ok)
	{
		alert("Erreur serveur");
		return;
	}
	alert("2FA activee!");
	navigate('profile');
}

(window as any).is2FA = is2FA;
(window as any).active2FA = active2FA;
(window as any).active2FAlater = active2FAlater;
(window as any).check2FACode = check2FACode;
(window as any).send2FACode = send2FACode;
(window as any).resend2FACode = resend2FACode;
