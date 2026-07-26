(function(){
  const esc=(value='')=>String(value).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const labels={domestic:'국내 뉴스',government:'부처 보도자료',overseas:'해외 자료',nature:'Nature News'};
  function renderList(id,items,kind){
    const el=document.getElementById(id); if(!el)return;
    const rows=(items||[]).slice(0,5);
    el.innerHTML=rows.length?rows.map((item,index)=>`<article class="news-source-item"><div class="news-source-meta"><span>${esc(item.source||labels[kind])}</span><time>${esc(item.date||'')}</time></div><a href="${esc(item.url||'#')}" target="_blank" rel="noopener noreferrer"><strong>${esc(item.title)}</strong><i class="bi bi-arrow-up-right"></i></a></article>`).join(''):`<div class="news-empty"><i class="bi bi-hourglass-split"></i><span>수집된 자료가 없습니다.</span></div>`;
  }
  async function loadNews(){
    try{
      const response=await fetch('data/news.json?ts='+Date.now(),{cache:'no-store'});
      if(!response.ok)throw new Error('news data load failed');
      const data=await response.json();
      renderList('domesticNewsList',data.domestic,'domestic');
      renderList('governmentNewsList',data.government,'government');
      renderList('overseasNewsList',data.overseas,'overseas');
      renderList('natureNewsList',data.nature,'nature');
      const stamp=document.getElementById('newsUpdatedAt');
      if(stamp)stamp.textContent=data.updated_at?`업데이트 ${data.updated_at}`:'업데이트 시간 미확인';
    }catch(error){
      ['domesticNewsList','governmentNewsList','overseasNewsList','natureNewsList'].forEach(id=>renderList(id,[],id));
      const stamp=document.getElementById('newsUpdatedAt');if(stamp)stamp.textContent='뉴스 데이터 준비 중';
      console.warn(error);
    }
  }
  document.addEventListener('DOMContentLoaded',loadNews);
})();
