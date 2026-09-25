// Deutschconfort — shared site behaviours
(function(){
  // ===========================================================
  //  CATALOGUE — un seul endroit à modifier
  //  Collez ici le lien de votre catalogue (Dropbox, PDF, etc.).
  //  Laissez vide ('') pour renvoyer vers la page Contact.
  var CATALOGUE_URL = 'https://www.dropbox.com/scl/fi/9hhsyysy1ccsky3o0idaq/CAT26_off.pdf?rlkey=byxeby8y7aiif2hwt53ch5bzw&st=yxn7ywde&dl=1';
  // ===========================================================

  function ready(fn){if(document.readyState!=='loading')fn();else document.addEventListener('DOMContentLoaded',fn);}
  ready(function(){
    // Catalogue : applique le lien à tous les boutons marqués data-catalogue
    if(CATALOGUE_URL){
      document.querySelectorAll('[data-catalogue]').forEach(function(a){
        a.href=CATALOGUE_URL;a.target='_blank';a.rel='noopener';
      });
    }

    // Mesure : clic WhatsApp = Contact, clic tel = Contact (Meta Pixel)
    document.addEventListener('click',function(e){
      var a=e.target.closest&&e.target.closest('a');
      if(!a||typeof fbq!=='function')return;
      var h=a.getAttribute('href')||'';
      if(h.indexOf('wa.me')>-1){fbq('track','Contact',{content_name:'whatsapp'});}
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