// Deutschconfort — shared site behaviours
(function(){
  // ===========================================================
  //  CATALOGUE — un seul endroit à modifier
  //  Collez ici le lien de votre catalogue (Dropbox, PDF, etc.).
  //  Laissez vide ('') pour renvoyer vers la page Contact.
  //  Catalogue Le Celestone 2026 (35 pages, sans prix), hébergé sur le site
  //  depuis le 14/10/2026 ; CATALOGUE_FILE = nom du fichier téléchargé.
  var CATALOGUE_URL = '/media/catalogue-le-celestone-2026.pdf';
  var CATALOGUE_FILE = 'Deutschconfort_Catalogue_LeCelestone_2026.pdf';
  // ===========================================================

  function ready(fn){if(document.readyState!=='loading')fn();else document.addEventListener('DOMContentLoaded',fn);}
  ready(function(){
    // Catalogue : applique le lien à tous les boutons marqués data-catalogue
    if(CATALOGUE_URL){
      document.querySelectorAll('[data-catalogue]').forEach(function(a){
        a.href=CATALOGUE_URL;a.setAttribute('download',CATALOGUE_FILE);
        a.removeAttribute('target');a.removeAttribute('rel');
      });
    }

    // Mesure : clic WhatsApp = Contact, clic tel = Contact (Meta Pixel)
    //          clic catalogue = TelechargementCatalogue (événement personnalisé)
    document.addEventListener('click',function(e){
      var a=e.target.closest&&e.target.closest('a');
      if(!a||typeof fbq!=='function')return;
      var h=a.getAttribute('href')||'';
      if(a.hasAttribute('data-catalogue')){fbq('trackCustom','TelechargementCatalogue',{page:location.pathname});}
      else if(h.indexOf('wa.me')>-1){fbq('track','Contact',{content_name:'whatsapp'});}
      else if(h.indexOf('tel:')===0){fbq('track','Contact',{content_name:'tel'});}
    });

    var burger=document.querySelector('.burger');
    var menu=document.querySelector('.mobile-menu');
    if(burger&&menu){
      burger.addEventListener('click',function(){menu.classList.add('open');document.body.style.overflow='hidden';});
      var close=menu.querySelector('.mclose');
      if(close)close.addEventListener('click',function(){menu.classList.remove('open');document.body.style.overflow='';});
      menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){menu.classList.remove('open');document.body.style.overflow='';});});
    }
  });
})();