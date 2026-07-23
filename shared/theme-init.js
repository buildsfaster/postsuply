// post.supply: set theme before first paint, no flash of wrong theme.
(function(){
  var t = 'light';
  try{
    var s = localStorage.getItem('ps3_theme');
    t = s || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }catch(e){
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[post.supply] theme-init: could not read stored theme; defaulting to light', e);
    }
  }
  document.documentElement.setAttribute('data-theme', t);
  document.documentElement.style.colorScheme = t;
})();
