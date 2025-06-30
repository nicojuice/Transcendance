import { showToast } from "./showToast";

async function getToken(): Promise<string | null> {
  return localStorage.getItem("token");
}

export async function userIsWaitingForA2FACode(): Promise<boolean> {
  const id = await getId();
  const token = await getToken();

  if (!id || !token) return true;

  const response = await fetch("http://localhost:8100/api/waiting-for-a-code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    showToast("Erreur serveur - code 500", "error");
    return true;
  }

  const success = (await response.json()).success;
  return success;
}

export async function getUser(): Promise<any> {
  const token = await getToken();
  if (!token) throw null;

  const response = await fetch("http://localhost:8101/api/jwt/get-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    showToast("Erreur serveur - code 500", "error");
    throw null;
  }

  const user = (await response.json()).user;
  if (!user) throw null;

  return user;
}

export async function getUsername(): Promise<string | null> {
  try {
    return (await getUser()).name;
  } catch {
    return null;
  }
}

export async function getEmail(): Promise<string | null> {
  try {
    return (await getUser()).email;
  } catch {
    return null;
  }
}

export async function getId(): Promise<number | null> {
  try {
    return (await getUser()).id;
  } catch {
    return null;
  }
}

export async function getAvatar(): Promise<Blob | null> {
  try {
    return (await getUser()).avatar;
  } catch {
    return null;
  }
}

export async function getPass(): Promise<string | null> {
  try {
    return (await getUser()).password;
  } catch {
    return null;
  }
}

export async function getEnabledFA(): Promise<number | null> {
  try {
    return (await getUser()).enabled_fa;
  } catch {
    return null;
  }
}

export async function getStatus(): Promise<number | null> {
  try {
    return (await getUser()).status;
  } catch {
    return null;
  }
}
