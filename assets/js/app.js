const state={data:null,charts:[],currentView:'technology',currentTopic:null,currentSubtopic:null,newsFilter:'전체'};
const $=s=>document.querySelector(s); const $$=s=>[...document.querySelectorAll(s)];
async function init(){try{if(window.DASHBOARD_DATA){state.data=window.DASHBOARD_DATA;}else{const r=await fetch('data/dashboard.json');if(!r.ok)throw new Error('data load failed');state.data=await r.json();}renderAll();bindEvents();}catch(e){document.body.innerHTML='<main style="padding:40px;font-family:sans-serif"><h1>데이터를 불러오지 못했습니다.</h1><p>파일 구성과 경로를 확인해 주세요.</p></main>'}}
function renderAll(){
  renderYears();
  renderHero();
  renderKpis();
  renderIssues();
  renderSchedules();
  renderQuickAccess();
  renderCharts();
  renderPromptChips();
  initCatalogFilters();
  applyUrlState();
}
function renderYears(){const el=$('#yearSelect');el.innerHTML=state.data.years.map(y=>`<option>${y}</option>`).join('')}
function renderHero() {
  const dateElement = document.querySelector('#agendaDate');
  if (dateElement) {
    dateElement.textContent = new Intl.DateTimeFormat('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    }).format(new Date());
  }
  renderAgenda();
}

async function renderAgenda() {
  const statusEl = $('#agendaStatus');
  const listEl = $('#agendaList');
  const summaryEl = $('#agendaSummary');
  const updatedEl = $('#agendaUpdated');
  if (!statusEl || !listEl) return;

  try {
    const response = await fetch(`data/agenda.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const events = Array.isArray(data.events) ? data.events : [];
    const now = new Date();
    const todayKey = localDateKey(now);
    const todayEvents = events.filter(event => localDateKey(new Date(event.start)) === todayKey);
    const visibleEvents = (todayEvents.length ? todayEvents : events).slice(0, 4);

    $('#agendaTodayCount').textContent = String(data.today_count ?? todayEvents.length);
    $('#agendaWeekCount').textContent = String(data.week_count ?? events.length);
    $('#agendaNextLabel').textContent = nextAgendaLabel(events, now);
    summaryEl.hidden = false;

    if (visibleEvents.length) {
      statusEl.hidden = true;
      listEl.innerHTML = visibleEvents.map(event => agendaItemTemplate(event, todayEvents.length === 0)).join('');
    } else {
      statusEl.hidden = false;
      statusEl.className = 'agenda-status is-empty';
      statusEl.innerHTML = '<i class="bi bi-calendar-check"></i><span>오늘과 앞으로 7일간 등록된 일정이 없습니다.</span>';
      listEl.innerHTML = '';
    }

    if (data.status === 'error') {
      statusEl.hidden = false;
      statusEl.className = 'agenda-status is-error';
      statusEl.innerHTML = '<i class="bi bi-exclamation-triangle"></i><span>캘린더 동기화가 필요합니다. Actions를 실행해 주세요.</span>';
    }

    updatedEl.textContent = data.updated_at ? `업데이트 ${formatAgendaUpdated(data.updated_at)}` : '';
  } catch (error) {
    summaryEl.hidden = true;
    listEl.innerHTML = '';
    statusEl.hidden = false;
    statusEl.className = 'agenda-status is-error';
    statusEl.innerHTML = '<i class="bi bi-exclamation-triangle"></i><span>일정 데이터를 불러오지 못했습니다.</span>';
    updatedEl.textContent = '';
    console.error('Agenda load failed:', error);
  }
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function agendaItemTemplate(event, showDate) {
  const start = new Date(event.start);
  const end = event.end ? new Date(event.end) : null;
  const category = agendaCategory(event.title || '', event.description || '');
  const timeText = agendaTimeRange(start, end, Boolean(event.all_day));
  const dateText = new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric', day: 'numeric', weekday: 'short'
  }).format(start);
  const meta = showDate ? `${dateText} · ${timeText}` : timeText;
  const location = event.location
    ? `<span class="agenda-item-location"><i class="bi bi-geo-alt"></i>${escapeHtml(event.location)}</span>`
    : '';

  return `<article class="agenda-item" style="--agenda-accent:${category.color}">
    <div class="agenda-item-time">${escapeHtml(meta)}</div>
    <div class="agenda-timeline" aria-hidden="true">
      <span class="agenda-timeline-dot"><i class="bi ${category.icon}"></i></span>
    </div>
    <div class="agenda-item-panel">
      <div class="agenda-item-heading">
        <strong>${escapeHtml(event.title || '제목 없는 일정')}</strong>
        <span class="agenda-item-category">${escapeHtml(category.label)}</span>
      </div>
      ${location}
    </div>
  </article>`;
}

function agendaTimeRange(start, end, allDay) {
  if (allDay) return '종일';
  const formatter = new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit', minute: '2-digit', hour12: false
  });
  const startText = formatter.format(start);
  if (!end || Number.isNaN(end.getTime())) return startText;
  const endText = formatter.format(end);
  return `${startText}–${endText}`;
}

function agendaCategory(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const rules = [
    { words: ['과기부', '정책', '법', '시행령', '규제', '정부', '부처'], label: '정책', icon: 'bi-building', color: '#79c6ff' },
    { words: ['논문', '연구', '보고서', '원고', '리비전', 'revision', '세미나'], label: '연구', icon: 'bi-journal-text', color: '#8ee3b4' },
    { words: ['회의', '미팅', '면담', '자문', '간담회', 'meeting'], label: '회의', icon: 'bi-people', color: '#c3a6ff' },
    { words: ['강의', '수업', '발표', '인터뷰', '영어'], label: '강의·발표', icon: 'bi-mic', color: '#ffd18a' },
    { words: ['병원', '예방접종', '가족', '육아', '정원', '주호', '채원'], label: '가족', icon: 'bi-house-heart', color: '#ffaaa8' }
  ];
  return rules.find(rule => rule.words.some(word => text.includes(word))) || {
    label: '일정', icon: 'bi-calendar-event', color: '#9edbff'
  };
}

function nextAgendaLabel(events, now) {
  const next = events.map(event => new Date(event.start)).find(date => date >= now);
  if (!next) return '-';
  if (localDateKey(next) === localDateKey(now)) {
    return new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(next);
  }
  return new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric' }).format(next);
}

function formatAgendaUpdated(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
  }).format(date);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}
function renderIssues(){$('#issueList').innerHTML=state.data.issues.slice(0,5).map(i=>`<div class="issue-item"><span class="badge ${i.level==='긴급'?'urgent':''}">${i.level}</span><span>${i.title}</span><span class="dday">${i.dday}</span></div>`).join('')}
function renderSchedules(){$('#scheduleList').innerHTML=state.data.schedules.slice(0,5).map(s=>`<div class="schedule-item"><span class="badge">${s.date}</span><span>${s.title}</span><i class="bi bi-chevron-right"></i></div>`).join('')}
function renderNews(filter=state.newsFilter){state.newsFilter=filter;const items=(state.data.news||[]).filter(n=>filter==='전체'||n.category===filter);$('#newsGrid').innerHTML=items.map(n=>`<article class="news-card"><div class="news-meta"><span class="news-category">${n.category}</span><span>${n.source} · ${n.date}</span></div><h3>${n.title}</h3><p>${n.summary||''}</p><a href="${n.url||'#'}" ${n.url&&n.url!=='#'?'target="_blank" rel="noopener noreferrer"':''}>기사 보기 <i class="bi bi-arrow-up-right"></i></a></article>`).join('')||'<p class="empty-state">등록된 뉴스가 없습니다.</p>';$$('.news-filter').forEach(b=>b.classList.toggle('active',b.dataset.newsFilter===filter))}
function renderKpis(){$('#kpiGrid').innerHTML=state.data.kpis.map(k=>`<article class="kpi-card" style="--accent:${k.color};--soft:${k.soft}" title="출처: ${k.source||''}"><div class="kpi-top"><span class="kpi-label">${k.area}</span><span class="kpi-icon"><i class="bi ${k.icon}"></i></span></div><div class="kpi-name">${k.label}</div><div class="kpi-value">${k.value}</div><div class="kpi-meta">${k.meta}</div><div class="kpi-source">${k.id} · ${k.source||''}</div></article>`).join('')}
function renderQuickAccess(){
  const colors={technology:'#2f6df6',policy:'#2f9b58',industry:'#7357e9',institution:'#ef7d32'};
  $('#topicGrid').innerHTML=state.data.quickAccess.map(t=>`<article class="topic-card" style="--topic-accent:${colors[t.category]}"><div class="topic-card-top"><span class="topic-icon"><i class="bi ${t.icon}"></i></span><span class="topic-category">${t.categoryLabel}</span></div><div class="topic-title-row"><h3>${t.title}</h3>${t.badge?`<span class="topic-badge">${t.badge}</span>`:''}</div><p>${t.description}</p><div class="topic-actions"><a class="topic-primary" href="${t.internalUrl}" data-topic-link data-view="${t.category}" data-topic="${t.slug}">바로가기 <i class="bi bi-arrow-right"></i></a>${t.bioinUrl?`<a class="topic-external" href="${t.bioinUrl}" target="_blank" rel="noopener noreferrer">BioIN <i class="bi bi-box-arrow-up-right"></i></a>`:''}</div></article>`).join('')
}
function chartOptions(){return {responsive:true,maintainAspectRatio:false,interaction:{intersect:false,mode:'index'},plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{color:'#7e8da2'}},y:{beginAtZero:false,grid:{color:'rgba(120,140,170,.15)'},ticks:{color:'#7e8da2'}}}}}
function makeLine(id,data,color){return new Chart($(id),{type:'line',data:{labels:data.labels,datasets:[{data:data.data,borderColor:color,backgroundColor:hexToRgba(color,.12),fill:true,tension:.35,pointRadius:4,pointBackgroundColor:color,borderWidth:2.5}]},options:chartOptions()})}
function hexToRgba(hex,a){const n=parseInt(hex.slice(1),16);return `rgba(${n>>16},${n>>8&255},${n&255},${a})`}
function renderCharts(){state.charts.forEach(c=>c.destroy());state.charts=[];const d=state.data.charts;state.charts.push(makeLine('#policyChart',d.policy,'#2f9b58'));state.charts.push(makeLine('#technologyChart',d.technology,'#2f6df6'));state.charts.push(makeLine('#industryChart',d.industry,'#7357e9'));state.charts.push(makeLine('#workforceChart',d.workforce,'#ef7d32'))}
function getTopicItems(key){return Object.entries(state.data.topicDetails?.[key]||{})}
function renderTopicNavigation(key,selected=null){
  const section=state.data.sections[key];
  $('#topicMenuTitle').textContent=`${section.title} 주제`;
  $('#topicMenuEyebrow').textContent=`${section.title.toUpperCase()} TOPICS`;
  $('#topicSideNav').innerHTML=getTopicItems(key).map(([slug,item])=>`<a href="index.html?view=${key}&topic=${slug}" class="topic-side-link ${slug===selected?'active':''}" data-topic-link data-view="${key}" data-topic="${slug}"><span>${item.title}</span><i class="bi bi-chevron-right"></i></a>`).join('');
}
function renderTopicDetail(key,slug=null){
  state.currentTopic=slug;
  renderTopicNavigation(key,slug);
  const detail=slug?state.data.topicDetails?.[key]?.[slug]:null;
  const section=state.data.sections[key];
  $('#topicCategoryLabel').textContent=detail?`${section.title} / QUICK RESEARCH`:`${section.title} INTELLIGENCE`;
  $('#topicDetailTitle').textContent=detail?detail.title:`${section.title} 분야 개요`;
  $('#topicDetailSummary').textContent=detail?detail.summary:section.description;
  const cards=detail?.sections||section.questions.map((q,i)=>[`핵심 질문 ${i+1}`,q]);
  $('#topicDetailGrid').innerHTML=cards.map(([title,text])=>`<article class="topic-detail-card"><h3>${title}</h3><p>${text}</p></article>`).join('');
  $('#topicOverviewButton').style.visibility=detail?'visible':'hidden';
}
function updateUrl(view,topic=null,subtopic=null){const u=new URL(window.location.href);if(view==='dashboard'){u.search=''}else{u.searchParams.set('view',view);if(topic)u.searchParams.set('topic',topic);else u.searchParams.delete('topic');if(subtopic)u.searchParams.set('subtopic',subtopic);else u.searchParams.delete('subtopic')}history.pushState({},'',u)}
function applyUrlState(){const p=new URLSearchParams(location.search);const view=p.get('view')||'dashboard';const topic=p.get('topic');const subtopic=p.get('subtopic');setView(view,topic,false,subtopic)}

function technologyStatusClass(status){
  if(status==='진행 중') return 'is-doing';
  if(status==='검토') return 'is-review';
  if(status==='상시') return 'is-always';
  return 'is-plan';
}
function renderTechnologyTopic(slug){
  const data=state.data.technologyV14;
  const topic=data.topics[slug]||Object.values(data.topics)[0];
  state.currentTopic=slug;
  $$('.technology-topic-tab').forEach(tab=>tab.classList.toggle('active',tab.dataset.topic===slug));
  $('#technologyTopicTitle').textContent=topic.title;
  $('#technologyTopicDefinition').textContent=topic.definition;
  $('#technologyAgendaList').innerHTML=topic.agenda.map(item=>`<article class="technology-agenda-item"><div><strong>${item.title}</strong><p>${item.description}</p></div><span class="technology-status ${technologyStatusClass(item.status)}">${item.status}</span></article>`).join('');
  $('#technologyCoreTech').innerHTML=topic.coreTech.map(item=>`<span class="technology-chip">${item}</span>`).join('');
  $('#technologyTrendTabs').innerHTML=Object.keys(topic.trends).map((name,i)=>`<button class="technology-trend-tab ${i===0?'active':''}" data-trend="${name}">${name}</button>`).join('');
  $('#technologyTrendContent').textContent=topic.trends[Object.keys(topic.trends)[0]];
  $('#technologyResourceList').innerHTML=topic.resources.map(item=>`<article class="technology-resource-item"><span class="resource-kind">${item.type}</span><strong>${item.title}</strong><i class="bi bi-arrow-up-right"></i></article>`).join('');
}
function renderTechnologyV14(topic=null){
  const data=state.data.technologyV14;
  const entries=Object.entries(data.topics);
  const selected=topic&&data.topics[topic]?topic:entries[0][0];
  $('#technologyTopicTabs').innerHTML=entries.map(([slug,item])=>`<button class="technology-topic-tab ${slug===selected?'active':''}" data-topic="${slug}"><strong>${item.title}</strong><span>${item.short}</span></button>`).join('');
  $('#technologyGeneralKpis').innerHTML=data.generalKpis.map(item=>`<article class="technology-general-kpi"><span>${item.label}</span><strong>${item.value}</strong><small>${item.meta}</small></article>`).join('');
  $('#technologyAiQuestions').innerHTML=data.aiQuestions.map((item,i)=>`<button class="technology-ai-question"><span>AI 정책질문 ${i+1}</span><strong>${item.title}</strong><p>${item.description}</p></button>`).join('');
  renderTechnologyTopic(selected);
}


function renderResearchList(containerId,items,fallbackTitle,kind){
  const normalized=(items||[]).slice(0,6);
  if(!normalized.length){
    $(containerId).innerHTML=`<article class="research-list-item is-placeholder"><span>${kind}</span><strong>${fallbackTitle} 자료를 추가해 주세요</strong><i class="bi bi-plus-circle"></i></article>`;
    return;
  }
  $(containerId).innerHTML=normalized.map(item=>`<article class="research-list-item"><span>${item.type||kind}</span><strong>${item.title}</strong><i class="bi bi-arrow-up-right"></i></article>`).join('');
}
function renderResearchSubtopic(item,subtopic=null){
  const selected=subtopic&&item.children.includes(subtopic)?subtopic:null;
  state.currentSubtopic=selected;
  $$('.research-subtopic').forEach(card=>card.classList.toggle('active',card.dataset.subtopic===selected));
  const label=$('#researchSelectedSubtopic');
  label.hidden=!selected;
  if(selected)label.innerHTML=`<span>SELECTED SUBTOPIC</span><strong>${selected}</strong><button type="button" data-clear-subtopic>전체 자료 보기</button>`;
  const prefix=selected?`${selected} · `:'';
  const filterItems=(items)=>{
    if(!selected)return items;
    const matched=(items||[]).filter(x=>(x.subtopic||'')===selected||x.title.includes(selected));
    return matched.length?matched:items;
  };
  renderResearchList('#researchReports',filterItems(item.reports),`${prefix}${item.title} Featured Report`,'REPORT');
  renderResearchList('#researchResources',filterItems(item.resources),`${prefix}${item.title} Resource`,'SOURCE');
  renderResearchList('#researchHylab',filterItems(item.hylab),`${prefix}${item.title} HsLab Report`,'HSLAB');
  renderResearchList('#researchNotes',filterItems(item.notes),`${prefix}${item.title} Research Note`,'NOTE');
}
function renderResearchArea(key,slug=null,subtopic=null){
  const area=state.data.researchAreasV2?.[key];
  if(!area)return;
  const entries=Object.entries(area.topics);
  const selected=slug&&area.topics[slug]?slug:null;
  $('#researchEyebrow').textContent=area.eyebrow;
  $('#researchOverviewTitle').textContent=area.title;
  $('#researchOverviewText').textContent=area.overview;
  $('#researchAreaHeading').textContent=`${area.title} Areas`;
  $('#researchStats').innerHTML=area.stats.map(([value,label])=>`<article class="research-stat"><strong>${value}</strong><span>${label}</span></article>`).join('');
  $('#researchAreaGrid').innerHTML=entries.map(([topic,item])=>`<a class="research-area-card ${topic===selected?'active':''}" href="index.html?view=${key}&topic=${topic}" data-topic-link data-view="${key}" data-topic="${topic}"><span class="research-card-icon"><i class="bi ${item.icon}"></i></span><span class="research-card-kicker">${item.short}</span><h3>${item.title}</h3><p>${item.summary}</p><div class="research-card-children">${item.children.map(child=>`<span>${child}</span>`).join('')}</div><strong class="research-card-link">Explore <i class="bi bi-arrow-right"></i></strong></a>`).join('');
  $('#researchQuestionHeading').textContent=key==='technology'?'AI 정책질문':'핵심 연구질문';
  $('#researchQuestions').innerHTML=area.questions.map((q,i)=>`<article class="research-question"><span>Q${String(i+1).padStart(2,'0')}</span><strong>${q}</strong></article>`).join('');
  $('#researchTopicPanel').hidden=!selected;
  if(!selected){state.currentSubtopic=null;return;}
  const item=area.topics[selected];
  $('#researchBreadcrumb').innerHTML=`<button data-view="${key}">Research</button><i class="bi bi-chevron-right"></i><button data-view="${key}">${area.title}</button><i class="bi bi-chevron-right"></i><strong>${item.title}</strong>`;
  $('#researchTopicEyebrow').textContent=`${area.eyebrow} / TOPIC`;
  $('#researchTopicTitle').textContent=item.title;
  $('#researchTopicSummary').textContent=item.summary;
  $('#researchSubtopicGrid').innerHTML=item.children.map((child,i)=>`<button class="research-subtopic ${child===subtopic?'active':''}" type="button" data-subtopic="${child}"><span>${String(i+1).padStart(2,'0')}</span><h3>${child}</h3><p>${item.title} 분야의 ${child} 관련 자료를 축적하고 연결합니다.</p><strong>자료 보기 <i class="bi bi-arrow-right"></i></strong></button>`).join('');
  renderResearchSubtopic(item,subtopic);
  requestAnimationFrame(()=>$('#researchTopicPanel').scrollIntoView({behavior:'smooth',block:'start'}));
}
function renderSection(key,topic=null,subtopic=null){
  const s=state.data.sections[key];
  document.documentElement.style.setProperty('--hero1',s.colors[0]);
  document.documentElement.style.setProperty('--hero2',s.colors[1]);
  const isResearch=['technology','policy','industry','institution'].includes(key);
  const area=state.data.researchAreasV2?.[key];
  $('#sectionHero').innerHTML=`<span class="eyebrow light">${area?.eyebrow||s.title.toUpperCase()}</span><h2>${area?.title||s.title}</h2><p>${area?.subtitle||s.description}</p>`;
  $('#researchWorkspace').hidden=!isResearch;
  $('#legacySectionSummary').style.display='none';
  $('#legacyIndicatorPanel').style.display='none';
  if(isResearch)renderResearchArea(key,topic,subtopic);
}
function renderIndicatorTable(filter=''){
  const stats=window.HSLAB_STATISTICS;
  const q=($('#indicatorSearch')?.value||'').trim().toLowerCase();
  const category=$('#categoryFilter')?.value||'';
  if(stats){
    const rows=stats.catalog.filter(r=>(!category||r.category===category)&&(!q||[r.id,r.category,r.subcategory,r.title,r.status,r.linkedMenu].join(' ').toLowerCase().includes(q)));
    $('#catalogSummary').textContent=`총 ${stats.catalogCount}개 통계 · 원자료: ${stats.sourceWorkbook}`;
    $('#indicatorTable').innerHTML=rows.map(r=>`<tr><td><strong>${r.id}</strong></td><td>${r.category}</td><td>${r.subcategory}</td><td>${r.title}</td><td>${r.latestYear||'-'}</td><td><span class="status-pill ${r.status.includes('필요')?'needs-update':''}">${r.status}</span></td><td><a class="source-link" href="${r.sourceFile}" download>Excel <i class="bi bi-download"></i></a></td></tr>`).join('')||'<tr><td colspan="7">검색 결과가 없습니다.</td></tr>';
    return;
  }
  const rows=state.data.indicators.filter(r=>r.join(' ').toLowerCase().includes(q));
  $('#indicatorTable').innerHTML=rows.map(r=>`<tr>${r.map(c=>`<td>${c||'-'}</td>`).join('')}</tr>`).join('')||'<tr><td colspan="7">검색 결과가 없습니다.</td></tr>';
}
function initCatalogFilters(){
  const stats=window.HSLAB_STATISTICS;if(!stats||!$('#categoryFilter'))return;
  const cats=[...new Set(stats.catalog.map(r=>r.category))];
  $('#categoryFilter').innerHTML='<option value="">전체 대분류</option>'+cats.map(c=>`<option value="${c}">${c}</option>`).join('');
}
function setView(view,topic=null,shouldUpdateUrl=true,subtopic=null){
  state.currentView=view;
  state.currentTopic=topic;
  state.currentSubtopic=subtopic;

  const statisticsHub=$('#statisticsHub');
  if(statisticsHub)statisticsHub.hidden=view!=='explorer';

  const industryLink=$('#industryStatisticsLink');
  if(industryLink)industryLink.hidden=view!=='industry';

  $$('.view').forEach(v=>v.classList.remove('active'));
  $$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===view));

  const labels={dashboard:'DASHBOARD',technology:'TECHNOLOGY',policy:'POLICY',industry:'INDUSTRY',institution:'REGULATION',explorer:'DATA',archive:'ARCHIVE',assistant:'AI ASSISTANT'};
  $('#breadcrumbLabel').textContent=labels[view]||'DASHBOARD';

  if(view==='dashboard'){
    $('#dashboardView').classList.add('active');
    $('#pageTitle').textContent='HsLab';
    $('#pageSubtitle').textContent='오늘의 현안에서 기술·정책·산업·규제까지 한눈에 살펴봅니다.';
  }else if(view==='assistant'){
    $('#assistantView').classList.add('active');
    $('#pageTitle').textContent='AI 정책 Q&A';
    $('#pageSubtitle').textContent='등록된 정책정보를 연결해 빠르게 탐색합니다.';
  }else{
    $('#sectionView').classList.add('active');
    const key=['technology','policy','industry','institution'].includes(view)?view:'technology';
    renderSection(key,topic,subtopic);
    if(view==='explorer'||view==='archive'){
      $('#legacySectionSummary').style.display='none';
      $('#legacyIndicatorPanel').style.display='block';
      renderIndicatorTable(view);
      $('#sectionHero').innerHTML=`<span class="eyebrow light">${view==='explorer'?'DATA EXPLORER':'POLICY ARCHIVE'}</span><h2>${view==='explorer'?'통계·데이터':'정책자료실'}</h2><p>${view==='explorer'?'기술·정책·산업·규제 지표를 통합 검색합니다.':'향후 보고서·법령·통계 원문을 축적할 공간입니다.'}</p>`;
    }
    const researchTitle=topic&&state.data.researchAreasV2?.[key]?.topics?.[topic]?.title;
    $('#pageTitle').textContent=researchTitle||(view==='explorer'?'통계·데이터':view==='archive'?'정책자료실':state.data.researchAreasV2?.[key]?.title||state.data.sections[key].title);
    $('#pageSubtitle').textContent=topic?'선택한 세부 영역과 하위꼭지의 자료를 탐색합니다.':'영역 카드를 통해 하위 주제와 자료로 이동합니다.';
  }

  if(shouldUpdateUrl)updateUrl(view,topic,subtopic);
  closeSidebar();
  window.scrollTo({top:0,behavior:'smooth'});
}

function renderPromptChips(){const prompts=['합성생물학을 4개 영역으로 요약해줘','BT 투자 지표를 알려줘','바이오산업 인력 현황은?'];$('#promptChips').innerHTML=prompts.map(p=>`<button class="prompt-chip">${p}</button>`).join('')}
function answerQuestion(q){const t=Object.keys(state.data.topics).find(k=>q.includes(k));if(t){const o=state.data.topics[t];return `${t}은 다음과 같이 연결됩니다.\n\n기술: ${o.기술.join(', ')}\n정책: ${o.정책.join(', ')}\n산업: ${o.산업.join(', ')}\n제도: ${o.제도.join(', ')}`}if(q.includes('투자'))return '연결된 원자료 기준 정부 BT 연구개발비는 2020년 4조 1,253억 원이며, 바이오·의료 VC 신규투자는 2021년 1조 6,770억 원입니다.';if(q.includes('인력'))return '연결된 원자료 기준 바이오산업 종사자는 2020년 53,546명이고, 바이오 대학원 졸업자는 2021년 11,605명입니다.';return '현재 데모는 등록된 주제와 지표를 중심으로 답변합니다.'}
function addMessage(text,type){const d=document.createElement('div');d.className=type==='user'?'user-message':'assistant-message';d.textContent=text;$('#chatLog').appendChild(d);$('#chatLog').scrollTop=$('#chatLog').scrollHeight}
function bindEvents(){
  $$('.nav-item').forEach(n=>n.addEventListener('click',()=>setView(n.dataset.view)));
  document.addEventListener('click',e=>{
    const a=e.target.closest('[data-topic-link]');
    if(a){e.preventDefault();setView(a.dataset.view,a.dataset.topic);return;}
    const news=e.target.closest('.news-filter');
    if(news){renderNews(news.dataset.newsFilter);return;}
    const child=e.target.closest('.research-subtopic');
    if(child&&state.currentTopic){
      const area=state.data.researchAreasV2?.[state.currentView];
      const item=area?.topics?.[state.currentTopic];
      if(item){renderResearchSubtopic(item,child.dataset.subtopic);updateUrl(state.currentView,state.currentTopic,child.dataset.subtopic);}
      return;
    }
    if(e.target.closest('[data-clear-subtopic]')){
      const item=state.data.researchAreasV2?.[state.currentView]?.topics?.[state.currentTopic];
      if(item){renderResearchSubtopic(item,null);updateUrl(state.currentView,state.currentTopic,null);}
      return;
    }
    const b=e.target.closest('.research-breadcrumb button[data-view]');
    if(b)setView(b.dataset.view);
  });
  $('#researchOverviewButton').addEventListener('click',()=>setView(state.currentView));
  window.addEventListener('popstate',()=>{const p=new URLSearchParams(location.search);setView(p.get('view')||'dashboard',p.get('topic'),false,p.get('subtopic'))});
  $$('[data-jump]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.jump)));
  $('#themeButton').addEventListener('click',()=>{document.body.classList.toggle('dark');$('#themeButton i').className=document.body.classList.contains('dark')?'bi bi-sun':'bi bi-moon';setTimeout(renderCharts,80)});
  $('#menuButton').addEventListener('click',()=>{$('#sidebar').classList.add('open');$('#sidebarOverlay').classList.add('show')});
  $('#sidebarOverlay').addEventListener('click',closeSidebar);
  $('#indicatorSearch').addEventListener('input',()=>renderIndicatorTable(state.currentView));$('#categoryFilter')?.addEventListener('change',()=>renderIndicatorTable(state.currentView));
  $('#promptChips').addEventListener('click',e=>{if(e.target.matches('.prompt-chip')){$('#chatInput').value=e.target.textContent;$('#chatForm').requestSubmit()}});
  $('#chatForm').addEventListener('submit',e=>{e.preventDefault();const q=$('#chatInput').value.trim();if(!q)return;addMessage(q,'user');$('#chatInput').value='';setTimeout(()=>addMessage(answerQuestion(q),'assistant'),300)});
  $$('.topic-primary.disabled').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));
}
function closeSidebar(){$('#sidebar').classList.remove('open');$('#sidebarOverlay').classList.remove('show')}
document.addEventListener('DOMContentLoaded',init);
