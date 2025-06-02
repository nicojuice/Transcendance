export async function userIsWaitingForA2FACode() : Promise<boolean>
{
	const id = await getId();

	if (!id)
		return (true);
	const response = await fetch('http://localhost:8100/api/waiting-for-a-code', {
		method: "POST",
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ id })
	});
	if (!response.ok)
	{
		alert("Erreur serveur - code 500");
		return (true);
	}
	const success = (await response.json()).success;
	return (success);
}

export async function getUser() : Promise<any>
{
	const token = localStorage.getItem("token");
	if (!token)
		throw (null);

	const response = await fetch(`http://localhost:8101/api/jwt/get-user`, {
		method: "POST",
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ token })
	});
	if (!response.ok)
	{
		alert("Erreur serveur - code 500");
		throw (null);
	}
	const user = (await response.json()).user;
	if (!user)
		throw (null);
	return (user);
}

export async function getUsername() : Promise<string | null>
{
	try { return ((await getUser()).name); }
	catch (err) { return (null); }
}

export async function getEmail() : Promise<string | null>
{
	try { return ((await getUser()).email); }
	catch (err) { return (null); }
}

export async function getId() : Promise<number | null>
{
	try { return ((await getUser()).id); }
	catch (err) { return (null); }
}

export async function getAvatar() : Promise<Blob | null>
{
	try { return ((await getUser()).avatar); }
	catch (err) { return (null); }
}

export async function getPass() : Promise<string | null>
{
	try { return ((await getUser()).password); }
	catch (err) { return (null); }
}

export async function getEnabledFA() : Promise<number | null>
{
	try { return ((await getUser()).enabled_fa); }
	catch (err) { return (null); }
}

export async function getStatus() : Promise<number | null>
{
	try { return ((await getUser()).status); }
	catch (err) { return (null); }
}
