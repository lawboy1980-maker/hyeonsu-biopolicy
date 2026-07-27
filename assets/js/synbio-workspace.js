
(function(){
  const NEWS_KEYWORDS=['합성생물학','synthetic biology','바이오파운드리','biofoundry','공학생물학','engineering biology'];
  const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalizeNews=(payload)=>Array.isArray(payload)?payload:(payload.items||payload.news||payload.articles||[]);
  async function fetchJson(path){const r=await fetch(`${path}?v=${Date.now()}`,{cache:'no-store'});if(!r.ok)throw new Error(path);return r.json()}
  function renderFeed(el,items,kind){
    if(!el)return;
    if(!items.length){el.innerHTML='<p class="synbio-loading">등록된 자료가 없습니다.</p>';return;}
    el.innerHTML=items.slice(0,5).map(item=>{const url=item.url||item.link||'#';const external=url&&url!=='#';const meta=[item.source,item.date||item.published_at||item.updated].filter(Boolean).join(' · ');return `<a class="synbio-feed-item" href="${esc(url)}" ${external?'target="_blank" rel="noopener noreferrer"':''}><span class="kind">${esc(item.type||kind)}</span><span><strong>${esc(item.title||'제목 없음')}</strong><small>${esc(meta)}</small></span><i class="bi bi-arrow-up-right"></i></a>`}).join('');
  }
  async function loadSynbioData(){
    const newsEl=document.querySelector('#synbioNewsFeed');const reportEl=document.querySelector('#synbioReportFeed');
    try{const payload=await fetchJson('data/news.json');const all=normalizeNews(payload);let filtered=all.filter(x=>NEWS_KEYWORDS.some(k=>`${x.title||''} ${x.summary||''} ${x.category||''}`.toLowerCase().includes(k.toLowerCase())));if(!filtered.length)filtered=all;renderFeed(newsEl,filtered,'NEWS')}catch(e){if(newsEl)newsEl.innerHTML='<p class="synbio-loading">최신동향을 불러오지 못했습니다.</p>'}
    try{const payload=await fetchJson('data/synbio-reports.json');renderFeed(reportEl,normalizeNews(payload),'REPORT')}catch(e){if(reportEl)reportEl.innerHTML='<p class="synbio-loading">보고서 목록을 불러오지 못했습니다.</p>'}
  }
  function update(){const panel=document.querySelector('#researchTopicPanel');const workspace=document.querySelector('#synbioWorkspace');if(!panel||!workspace)return;const params=new URLSearchParams(location.search);const active=params.get('view')==='technology'&&params.get('topic')==='synthetic-biology';panel.classList.toggle('is-synbio',active);workspace.hidden=!active;if(active)loadSynbioData()}
  document.addEventListener('click',e=>{const btn=e.target.closest('[data-jump="assistant"]');if(btn){const nav=document.querySelector('[data-view="assistant"]');if(nav)nav.click()}});
  window.addEventListener('popstate',()=>setTimeout(update,0));
  document.addEventListener('click',e=>{if(e.target.closest('[data-topic-link],[data-view],[data-clear-subtopic]'))setTimeout(update,30)});
  document.addEventListener('DOMContentLoaded',()=>setTimeout(update,120));
})();
