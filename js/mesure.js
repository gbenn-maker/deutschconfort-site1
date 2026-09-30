/* Deutschconfort — mesure d'audience GA4 + consentement cookies (loi 09-08)
   Chargé sur toutes les pages publiques (pas sur /visualiseur/ ni les briefs).
   Le Meta Pixel n'est PAS piloté par ce fichier (il reste tel quel dans chaque page). */
(function(){
  // =====================================================================
  //  GA4 — UN SEUL ENDROIT À MODIFIER
  //  Collez ici l'ID de mesure GA4 (format 'G-XXXXXXXXXX').
  //  Laissé vide ('') : GA4 est inactif, aucune bannière n'est affichée,
  //  aucun cookie Google n'est déposé. Les événements restent en file locale.
  var GA4_ID = 'G-K3463B8J7W'; // propriété GA4 « deutsch-confort.com », flux Web (Ghali, 30/09/2026)
  // =====================================================================

  var KEY = 'dc_consent_ga4';        // choix mémorisé dans ce navigateur
  var MAX_AGE = 180 * 24 * 3600e3;   // on redemande au bout de 6 mois

  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  if (typeof window.gtag !== 'function') window.gtag = gtag;
  // Mode de consentement « basique » : rien n'est chargé avant l'accord.
  window.gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    analytics_storage: 'denied'
  });

  function readChoice(){
    try {
      var v = (localStorage.getItem(KEY) || '').split('|');
      if (!v[0]) return null;
      if (Date.now() - (+v[1] || 0) > MAX_AGE) return null;
      return v[0];
    } catch(e){ return null; }
  }
  function saveChoice(c){ try { localStorage.setItem(KEY, c + '|' + Date.now()); } catch(e){} }

  var loaded = false;
  function loadGA(){
    if (loaded || !GA4_ID) return;
    loaded = true;
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID);
    document.head.appendChild(s);
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID);
  }

  // Nom de page transmis avec chaque événement (ex. « facade-anti-humidite »)
  function pageName(){
    var p = location.pathname.replace(/^\/+|\/+$/g, '');
    if (!p || p === 'index.html') return 'accueil';
    return p.replace(/\/index\.html$/, '').replace(/\.html$/, '');
  }
  window.dcPageName = pageName;

  function waCode(href){
    try { var m = decodeURIComponent(href).match(/R[ée]f (W-[A-Z0-9]+)/); return m ? m[1] : ''; }
    catch(e){ return ''; }
  }

  function ready(fn){ if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  // ---------- Événements ----------
  // clic_whatsapp · clic_tel · envoi_devis (/devis) · dossier_projet (déclenché par /projet/)
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    var h = a.getAttribute('href') || '';
    if (h.indexOf('wa.me') > -1){
      window.gtag('event', 'clic_whatsapp', {
        page_name: pageName(), code_source: waCode(h),
        link_text: (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40)
      });
      if (a.id === 'send' && /devis/.test(location.pathname)){
        window.gtag('event', 'envoi_devis', { page_name: pageName(), code_source: waCode(h) });
      }
    } else if (h.indexOf('tel:') === 0){
      window.gtag('event', 'clic_tel', { page_name: pageName() });
    }
  }, true);

  ready(function(){
    // Formulaire de la page Contact (ouvre WhatsApp par script)
    var cf = document.getElementById('cform');
    if (cf) cf.addEventListener('submit', function(){
      window.gtag('event', 'clic_whatsapp', { page_name: pageName(), code_source: 'W-CON', link_text: 'formulaire contact' });
    });

    if (!GA4_ID) return;               // GA4 inactif : pas de bannière
    var choice = readChoice();
    if (choice === 'granted') loadGA();
    else if (choice !== 'denied') showBanner();

    // Lien « Gérer les cookies » en pied de page
    var bottom = document.querySelector('footer.site .bottom');
    if (bottom && !document.getElementById('dc-cookies-link')){
      var l = document.createElement('a');
      l.href = '#'; l.id = 'dc-cookies-link'; l.textContent = 'Gérer les cookies';
      l.style.cssText = 'color:inherit;border-bottom:1px solid rgba(245,242,236,.3)';
      l.addEventListener('click', function(ev){ ev.preventDefault(); showBanner(); });
      bottom.appendChild(l);
    }
  });

  function showBanner(){
    if (document.getElementById('dc-consent')) return;
    var root = location.pathname.indexOf('/projet/') === 0 ? '../' : '/';
    var b = document.createElement('div');
    b.id = 'dc-consent';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', 'Cookies de mesure d’audience');
    b.innerHTML =
      '<p>Nous aimerions mesurer l’audience du site avec Google Analytics (cookies). ' +
      'Rien n’est déposé sans votre accord. <a href="' + root + 'confidentialite.html">En savoir plus</a></p>' +
      '<div class="dc-c-btns"><button type="button" data-c="denied">Refuser</button>' +
      '<button type="button" data-c="granted" class="on">Accepter</button></div>';
    var css = document.createElement('style');
    css.textContent =
      '#dc-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:68;max-width:560px;margin:0 auto;' +
      'background:#14140F;color:#F5F2EC;padding:18px 20px;display:flex;gap:16px;align-items:center;flex-wrap:wrap;' +
      'font:300 14px/1.5 Jost,system-ui,sans-serif;box-shadow:0 10px 40px rgba(20,20,15,.35)}' +
      '#dc-consent p{flex:1 1 260px;margin:0}#dc-consent a{color:#F5F2EC;border-bottom:1px solid rgba(245,242,236,.5)}' +
      '#dc-consent .dc-c-btns{display:flex;gap:10px}' +
      '#dc-consent button{font:400 11.5px/1 Jost,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;' +
      'min-height:44px;padding:0 18px;border:1px solid rgba(245,242,236,.55);background:transparent;color:#F5F2EC;cursor:pointer}' +
      '#dc-consent button.on{background:#F5F2EC;color:#14140F;border-color:#F5F2EC}' +
      '@media(max-width:980px){#dc-consent{bottom:calc(76px + env(safe-area-inset-bottom))}}';
    document.head.appendChild(css);
    b.addEventListener('click', function(ev){
      var c = ev.target.getAttribute && ev.target.getAttribute('data-c');
      if (!c) return;
      saveChoice(c);
      if (c === 'granted') loadGA();
      else window.gtag('consent', 'update', { analytics_storage: 'denied' });
      b.parentNode.removeChild(b);
    });
    document.body.appendChild(b);
  }
})();
