// ============================================================
// PORTFOLIO — AHOUNOU Evrard
// Script principal : navigation, lightbox, formulaire de contact
// ============================================================

// ---------------------------------------------------------------
// NAVIGATION — sections affichées une par une, synchronisées avec
// l'URL (#projets) : le bouton « retour » et les liens partagés marchent.
// ---------------------------------------------------------------
const SECTION_TITLES = {
  accueil: 'Portfolio BTS SIO SISR',
  presentation: 'Présentation',
  competences: 'Compétences',
  projets: 'Projets',
  synthese: 'Tableau de synthèse',
  veille: 'Veille technologique',
  certifications: 'Certifications',
  cv: 'Curriculum Vitae',
  contact: 'Contact',
  mentions: 'Mentions légales'
};

function isSection(id) {
  const el = id && document.getElementById(id);
  return !!el && el.tagName === 'SECTION';
}

function showSection(id, updateHistory = true) {
  if (!isSection(id)) id = 'accueil';

  document.querySelectorAll('section').forEach(s => s.classList.toggle('active', s.id === id));

  // Sidebar, barre mobile : un seul état actif, partout
  document.querySelectorAll('.nav-links button, .tab-btn').forEach(b => {
    const on = b.dataset.section === id;
    b.classList.toggle('active', on);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    if (on && b.classList.contains('tab-btn')) {
      b.scrollIntoView({ block: 'nearest', inline: 'center' });
    }
  });

  document.title = 'AHOUNOU Evrard — ' + (SECTION_TITLES[id] || 'Portfolio');

  if (updateHistory && location.hash !== '#' + id) {
    try { history.pushState(null, '', '#' + id); } catch (e) { location.hash = id; }
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// Un seul écouteur pour tous les éléments [data-section] (sidebar, tabbar, boutons, footer, liens)
document.addEventListener('click', (e) => {
  const trigger = e.target.closest('[data-section]');
  if (!trigger) return;
  e.preventDefault();
  showSection(trigger.dataset.section);
});

window.addEventListener('popstate', () => showSection(location.hash.slice(1), false));
showSection(location.hash.slice(1), false);

// ---------------------------------------------------------------
// FORMULAIRE DE CONTACT — envoi AJAX (Formspree)
// ---------------------------------------------------------------
const form = document.getElementById('my-form');

if (form) {
  const status = document.getElementById('my-form-status');
  const button = document.getElementById('my-form-button');

  const setStatus = (msg, kind) => {
    status.textContent = msg;
    status.className = kind || '';
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    button.disabled = true;
    setStatus('Envoi en cours…');

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        setStatus('✓ Merci ! Votre message a bien été envoyé.', 'ok');
        form.reset();
      } else {
        let msg = "Oups ! Un problème est survenu lors de l'envoi.";
        try {
          const data = await response.json();
          if (data && Array.isArray(data.errors)) {
            msg = data.errors.map(err => err.message).join(', ');
          }
        } catch (_) { /* réponse non JSON : on garde le message par défaut */ }
        setStatus(msg, 'error');
      }
    } catch (_) {
      setStatus("Oups ! Impossible de joindre le serveur. Vérifiez votre connexion ou écrivez-moi directement par email.", 'error');
    } finally {
      button.disabled = false;
    }
  });
}

// ---------------------------------------------------------------
// LIGHTBOX — affichage en grand des images de projets
// Les infos viennent des attributs data-* du bouton cliqué.
// ---------------------------------------------------------------
const lightbox = document.getElementById('lightbox');
let lastFocus = null;

function openLightbox(trigger) {
  const d = trigger.dataset;
  const img = document.getElementById('lightbox-img');
  img.src = d.src;
  img.alt = d.title || '';
  document.getElementById('lightbox-cat').textContent = d.cat || '';
  document.getElementById('lightbox-title').textContent = d.title || '';
  document.getElementById('lightbox-desc').textContent = d.desc || '';

  lastFocus = trigger;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  document.getElementById('lightbox-close').focus();
}

function closeLightbox() {
  if (!lightbox.classList.contains('open')) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();
}

document.addEventListener('click', (e) => {
  const trigger = e.target.closest('[data-lightbox]');
  if (trigger) { openLightbox(trigger); return; }
  // Clic sur le fond sombre ou sur la croix
  if (e.target === lightbox || e.target.closest('#lightbox-close')) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});
