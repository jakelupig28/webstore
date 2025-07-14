// script.js - Fetch and display user profiles from the secure Vercel API

document.addEventListener('DOMContentLoaded', async () => {
  const profilesList = document.getElementById('profiles');
  if (!profilesList) return;

  try {
    // Get the user's JWT access token from Supabase session
    let accessToken = null;
    if (window.supabase && window.supabase.auth) {
      const session = await window.supabase.auth.getSession();
      accessToken = session.data.session?.access_token;
    } else if (window.client && window.client.auth) {
      const session = await window.client.auth.getSession();
      accessToken = session.data.session?.access_token;
    }

    const res = await fetch('/api/getProfiles', {
      headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}
    });
    if (!res.ok) throw new Error('Failed to fetch profiles');
    const profiles = await res.json();
    profilesList.innerHTML = '';
    if (profiles.length === 0) {
      profilesList.innerHTML = '<li>No profiles found.</li>';
      return;
    }
    profiles.forEach(profile => {
      const li = document.createElement('li');
      li.textContent = `ID: ${profile.id} | Role: ${profile.role} | Created: ${new Date(profile.created_at).toLocaleString()}`;
      profilesList.appendChild(li);
    });
  } catch (err) {
    profilesList.innerHTML = `<li>Error: ${err.message}</li>`;
  }
});
