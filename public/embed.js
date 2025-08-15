(function(){
  function getScriptBase(){
    try {
      const scripts = document.getElementsByTagName('script');
      const self = scripts[scripts.length - 1];
      const u = new URL(self.src);
      return u.origin;
    } catch(e){ return '' }
  }

  function mount(el){
    const slug = el.dataset.slug;
    if(!slug){ return }
    const limit = el.dataset.limit ? parseInt(el.dataset.limit, 10) : undefined;
    const origin = el.dataset.origin || getScriptBase() || '';
    const src = origin + '/embed/reviews/' + encodeURIComponent(slug) + (limit ? ('?limit=' + limit) : '');
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.setAttribute('title', 'Flex Reviews');
    iframe.setAttribute('loading', 'lazy');
    iframe.style.width = '100%';
    iframe.style.border = '0';
    iframe.style.display = 'block';
    iframe.className = 'flex-reviews-iframe';

    // keep aspect/height flexible — initial height minimal until resize message arrives
    iframe.style.height = (el.dataset.minHeight || '200') + 'px';

    el.innerHTML = '';
    el.appendChild(iframe);
  }

  function onMessage(ev){
    if(!ev || !ev.data || ev.data.type !== 'flex-reviews:height'){ return }
    const frames = document.getElementsByClassName('flex-reviews-iframe');
    for(var i=0;i<frames.length;i++){
      var f = frames[i];
      if(f.contentWindow === ev.source){
        f.style.height = Math.max(0, parseInt(ev.data.height||0,10)) + 'px';
        break;
      }
    }
  }

  function init(){
    window.addEventListener('message', onMessage);
    var targets = document.querySelectorAll('[data-flex-reviews], #flex-reviews');
    for(var i=0;i<targets.length;i++) mount(targets[i]);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
