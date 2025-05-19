async function editProfile(e: Event) {
  e.preventDefault();

  console.log("fun called");
  const elem = document.getElementById("edit-profil-popup");
  try {
    const response = await fetch(`../pages/editprofile.html`);
    if (!response.ok)
      throw new Error("Page not found");
    console.log("fetching editprofile.html...");
    const html = await response.text();
    console.log("Fetched HTML:", html);
    if (elem)
      elem.innerHTML = html;
    else
      console.log("element not found");
  } catch (err) {
    alert(err);
  }
 }

document.addEventListener("DOMContentLoaded", () => {
  (window as any).editProfile = editProfile;
});