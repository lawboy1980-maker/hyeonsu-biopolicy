(() => {
  'use strict';

  const NOTION_URL = 'https://app.notion.com/p/fa8d4fb285c74beb9448369af40c5fe1';
  const CHART_COLORS = ['#2f9b58','#7357e9','#ef7d32','#2f6df6','#d04f7c','#159a9c'];
  const $ = (s, root=document) => root.querySelector(s);

  function insertAfter(reference, node){ reference.parentNode.insertBefore(node, reference.nextSibling); }

  function trendDefinitions(){
    return [
      {key:'policy', title:'정부 BT 연구개발 투자', unit:'조 원', aliases:['정부 BT','연구개발비','R&D 투자','BT 연구개발']},
      {key:'industry', title:'바이오산업 시장규모', unit:'조 원', aliases:['시장규모','생산규모','바이오산업 규모']},
      {key:'vc', title:'바이오 벤처투자', unit:'억 원', aliases:['VC','벤처투자','신규투자']},
      {key:'technology', title:'바이오 SCIE 논문', unit:'편', aliases:['SCIE','논문']},
      {key:'patent', title:'바이오 특허 출원', unit:'건', aliases:['특허 출원','특허']},
      {key:'workforce', title:'바이오산업 종사자', unit:'명', aliases:['종사자','고용 인력','산업 인력']}
    ];
  }

  function normalizeSeries(raw){
    if(!raw) return null;
    if(Array.isArray(raw.labels) && Array.isArray(raw.data)) return {labels:raw.labels, data:raw.data};
    if(Array.isArray(raw.years) && Array.isArray(raw.values)) return {labels:raw.years, data:raw.values};
    if(Array.isArray(raw.series)) {
      const rows=raw.series;
      return {labels:rows.map(r=>r.year ?? r.label ?? r.x), data:rows.map(r=>Number(r.value ?? r.y))};
    }
    return null;
  }

  function findCatalogSeries(def){
    const stats=window.HSLAB_STATISTICS;
    if(!stats) return null;
    const pools=[stats.series, stats.timeSeries, stats.charts, stats.datasets].filter(Boolean);
    for(const pool of pools){
      const entries=Array.isArray(pool)?pool:Object.entries(pool).map(([key,value])=>({key,...value}));
      const found=entries.find(item=>{
        const text=JSON.stringify([item.key,item.id,item.title,item.label,item.name]).toLowerCase();
        return def.aliases.some(a=>text.includes(a.toLowerCase()));
      });
      const normalized=normalizeSeries(found);
      if(normalized) return normalized;
    }
    return null;
  }

  function getSeries(def){
    const dashboard=window.DASHBOARD_DATA || window.state?.data;
    const direct=normalizeSeries(dashboard?.charts?.[def.key]);
    return direct || findCatalogSeries(def);
  }

  function formatLatest(value, unit){
    if(value===undefined || value===null || Number.isNaN(Number(value))) return '-';
    return `${Number(value).toLocaleString('ko-KR')} ${unit}`;
  }

  function makeTrendSection(){
    const performance=$('.performance-section');
    if(!performance || $('#trendDashboardSection')) return;
    const section=document.createElement('section');
    section.id='trendDashboardSection';
    section.className='trend-dashboard-section';
    section.innerHTML=`
      <div class="section-title-row">
        <div><span class="eyebrow">LONG-TERM TREND</span><h2>핵심지표 트렌드</h2></div>
        <span class="data-note">최근 시계열 기준</span>
      </div>
      <div class="trend-grid" id="trendGrid"></div>`;
    insertAfter(performance,section);

    const grid=$('#trendGrid');
    trendDefinitions().forEach((def,index)=>{
      const series=getSeries(def);
      const card=document.createElement('section');
      card.className='panel chart-panel trend-card';
      card.innerHTML=`
        <div class="panel-heading">
          <div><span class="eyebrow">TREND ${String(index+1).padStart(2,'0')}</span><h3>${def.title}</h3></div>
          <div class="trend-meta"><span class="trend-latest">${series?formatLatest(series.data.at(-1),def.unit):'연결 대기'}</span></div>
        </div>
        ${series?`<div class="chart-wrap"><canvas id="trendChart${index}"></canvas></div>`:`<div class="trend-empty"><div><i class="bi bi-database-exclamation"></i><br>시계열 데이터 연결이 필요합니다.</div></div>`}`;
      grid.appendChild(card);
      if(series && window.Chart){
        new Chart($(`#trendChart${index}`),{
          type:'line',
          data:{labels:series.labels,datasets:[{data:series.data,borderColor:CHART_COLORS[index],backgroundColor:hexToRgba(CHART_COLORS[index],.10),fill:true,tension:.35,pointRadius:3,pointHoverRadius:5,borderWidth:2.2}]},
          options:{responsive:true,maintainAspectRatio:false,interaction:{intersect:false,mode:'index'},plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{color:'#7e8da2',maxRotation:0}},y:{beginAtZero:false,grid:{color:'rgba(120,140,170,.13)'},ticks:{color:'#7e8da2'}}}}
        });
      }
    });
  }

  function hexToRgba(hex,a){const n=parseInt(hex.slice(1),16);return `rgba(${n>>16},${n>>8&255},${n&255},${a})`;}

  function replaceScheduleWithStrategic(){
    const lead=$('.lead-grid');
    if(!lead) return;
    const panels=lead.querySelectorAll(':scope > .panel');
    if(panels.length<2) return;
    const panel=panels[1];
    panel.innerHTML=`
      <div class="panel-heading">
        <div><span class="eyebrow">STRATEGIC INTELLIGENCE</span><h2>Strategic Intelligence</h2></div>
        <span class="data-note">Notion 연계 예정</span>
      </div>
      <div class="strategic-grid">
        <article class="strategic-item"><span>STRENGTH</span><strong>바이오 R&D 및 공공 인프라 역량</strong></article>
        <article class="strategic-item"><span>WEAKNESS</span><strong>전문인력과 사업화 연계의 구조적 부족</strong></article>
        <article class="strategic-item"><span>OPPORTUNITY</span><strong>AI-Bio·바이오제조 중심의 정책 확대</strong></article>
        <article class="strategic-item"><span>THREAT</span><strong>글로벌 바이오안보와 공급망 규제 강화</strong></article>
        <article class="strategic-insight"><span class="eyebrow">STRATEGIC INSIGHT</span><strong>AI·자동화 인프라와 전문인력 정책을 함께 설계할 필요가 있습니다.</strong></article>
      </div>`;
  }

  function makeWorkspace(){
    const news=$('.hslab-news-panel, .news-panel');
    if(!news || $('#myWorkspacePanel')) return;
    const section=document.createElement('section');
    section.id='myWorkspacePanel';
    section.className='panel workspace-panel';
    section.innerHTML=`
      <div class="panel-heading">
        <div><span class="eyebrow">MY WORKSPACE</span><h2>My Workspace</h2><p>Notion에서 연구 메모·과제·보고서를 관리합니다.</p></div>
        <span class="data-note">Notion 연결</span>
      </div>
      <div class="workspace-layout">
        <div class="workspace-main">
          <span class="eyebrow">PERSONAL RESEARCH SPACE</span>
          <h3>HsLab에서 수집하고, Notion에서 생각하고 정리합니다.</h3>
          <p>현재는 사용자가 제공한 Notion 페이지로 안전하게 이동합니다. 추후 Notion API와 GitHub Actions를 연결하면 최근 문서와 할 일을 자동으로 표시할 수 있습니다.</p>
          <div class="workspace-actions">
            <a class="primary-button workspace-link" href="${NOTION_URL}" target="_blank" rel="noopener noreferrer"><i class="bi bi-box-arrow-up-right"></i> Notion 열기</a>
          </div>
        </div>
        <div class="workspace-side">
          <article class="workspace-chip"><i class="bi bi-journal-text"></i><strong>정책 메모</strong><small>아이디어와 검토 기록</small></article>
          <article class="workspace-chip"><i class="bi bi-check2-square"></i><strong>To Do</strong><small>이번 주 연구과제</small></article>
          <article class="workspace-chip"><i class="bi bi-file-earmark-text"></i><strong>보고서·논문</strong><small>작성 중 문서</small></article>
          <article class="workspace-chip"><i class="bi bi-diagram-3"></i><strong>SWOT·전략</strong><small>전략 인텔리전스</small></article>
        </div>
      </div>`;
    insertAfter(news,section);
  }

  function removeOldSections(){
    $('.topic-panel')?.classList.add('dashboard-v7-hidden');
    $('.analytics-section')?.classList.add('dashboard-v7-hidden');
  }

  function reorder(){
    const dashboard=$('#dashboardView');
    const performance=$('.performance-section');
    const trend=$('#trendDashboardSection');
    const lead=$('.lead-grid');
    const news=$('.hslab-news-panel, .news-panel');
    const workspace=$('#myWorkspacePanel');
    if(!dashboard || !performance) return;
    [performance,trend,lead,news,workspace].filter(Boolean).forEach(el=>dashboard.appendChild(el));
  }

  function boot(){
    if(!$('#dashboardView')) return;
    makeTrendSection();
    replaceScheduleWithStrategic();
    makeWorkspace();
    removeOldSections();
    reorder();
  }

  window.addEventListener('load',()=>setTimeout(boot,120));
})();
