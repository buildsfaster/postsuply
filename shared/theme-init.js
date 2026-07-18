// post.supply: set theme before first paint, no flash of wrong theme.
(function(){
  try{
    var s = localStorage.getItem('ps3_theme');
    var t = s || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.style.colorScheme = t;
  }catch(e){}
})();
