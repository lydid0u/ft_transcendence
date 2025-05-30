// app.js

const routes = {
  '#home': {
    path: 'pages/home.html',
    title: 'Accueil'
  },
  '#about': {
    path: 'pages/about.html',
    title: 'À propos'
  },
  '#contact': {
    path: 'pages/contact.html',
    title: 'Contact'
  }
};

function loadPage(hash) {
  const route = routes[hash] || routes['#home'];

  fetch(route.path)
    .then(res => res.ok ? res.text() : Promise.reject("Erreur 404"))
    .then(html => {
      document.getElementById('content').innerHTML = html;
      document.title = route.title;
    })
    .catch(() => {
      document.getElementById('content').innerHTML = '<h1>404</h1><p>Page introuvable.</p>';
      document.title = 'Erreur 404';
    });
}

window.addEventListener('hashchange', () => loadPage(location.hash));
window.addEventListener('DOMContentLoaded', () => loadPage(location.hash));
