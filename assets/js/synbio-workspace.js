(function(){
  function disableLegacySynbioWorkspace(){
    const panel=document.querySelector('#researchTopicPanel');
    const workspace=document.querySelector('#synbioWorkspace');
    if(panel)panel.classList.remove('is-synbio');
    if(workspace)workspace.hidden=true;
  }
  window.addEventListener('popstate',()=>setTimeout(disableLegacySynbioWorkspace,0));
  document.addEventListener('click',()=>setTimeout(disableLegacySynbioWorkspace,30));
  document.addEventListener('DOMContentLoaded',()=>setTimeout(disableLegacySynbioWorkspace,120));
})();
