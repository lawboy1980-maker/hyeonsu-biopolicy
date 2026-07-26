const state={data:null,charts:[],currentView:'technology',currentTopic:null};
const $=s=>document.querySelector(s); const $$=s=>[...document.querySelectorAll(s)];
async function init(){try{if(window.DASHBOARD_DATA){state.data=window.DASHBOARD_DATA;}else{const r=await fetch('data/dashboard.json');if(!r.ok)throw new Error('data load failed');state.data=await r.json();}renderAll();bindEvents();}catch(e){document.body.innerHTML='<main style="padding:40px;font-family:sans-serif"><h1>데이터를 불러오지 못했습니다.</h1><p>파일 구성과 경로를 확인해 주세요.</p></main>'}}
function renderAll(){renderYears();renderHero();renderIssues();renderSchedules();renderKpis();renderQuickAccess();renderCharts();renderPromptChips();applyUrlState()}
function renderYears(){const el=$('#yearSelect');el.innerHTML=state.data.years.map(y=>`<option>${y}</option>`).join('')}
function renderHero(){const first=state.data.issues[0];$('#heroSpotlight').innerHTML=`<span class="spotlight-label">오늘의 최우선 현안</span><div class="spotlight-title">${first.title}</div><div class="spotlight-meta"><div><span>우선순위</span><strong>${first.level}</strong></div><div><span>마감</span><strong>${first.dday}</strong></div><div><span>관련 영역</span><strong>정책·제도</strong></div><div><span>상태</span><strong>검토 중</strong></div></div>`}
function renderIssues(){$('#issueList').innerHTML=state.data.issues.slice(0,5).map(i=>`<div class="issue-item"><span class="badge ${i.level==='긴급'?'urgent':''}">${i.level}</span><span>${i.title}</span><span class="dday">${i.dday}</span></div>`).join('')}
function renderSchedules(){$('#scheduleList').innerHTML=state.data.schedules.slice(0,5).map(s=>`<div class="schedule-item"><span class="badge">${s.date}</span><span>${s.title}</span><i class="bi bi-chevron-right"></i></div>`).join('')}
function renderKpis(){$('#kpiGrid').innerHTML=state.data.kpis.map(k=>`<article class="kpi-card" style="--accent:${k.color};--soft:${k.soft}"><div class="kpi-top"><span class="kpi-label">${k.area}</span><span class="kpi-icon"><i class="bi ${k.icon}"></i></span></div><div class="kpi-name">${k.label}</div><div class="kpi-value">${k.value}</div><div class="kpi-meta">${k.meta.replace('▲','<strong>▲</strong>')}</div></article>`).join('')}
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
function updateUrl(view,topic=null){const u=new URL(window.location.href);if(view==='dashboard'){u.search=''}else{u.searchParams.set('view',view);if(topic)u.searchParams.set('topic',topic);else u.searchParams.delete('topic')}history.pushState({},'',u)}
function applyUrlState(){const p=new URLSearchParams(location.search);const view=p.get('view')||'technology';const topic=p.get('topic');setView(view,topic,false)}

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


function renderResearchArea(key,slug=null){
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
  $('#researchQuestions').innerHTML=area.questions.map((q,i)=>`<article class="research-question"><span>Q${String(i+1).padStart(2,'0')}</span><strong>${q}</strong></article>`).join('');
  $('#researchTopicPanel').hidden=!selected;
  if(!selected)return;
  const item=area.topics[selected];
  $('#researchBreadcrumb').innerHTML=`<button data-view="${key}">Research</button><i class="bi bi-chevron-right"></i><button data-view="${key}">${area.title}</button><i class="bi bi-chevron-right"></i><strong>${item.title}</strong>`;
  $('#researchTopicEyebrow').textContent=`${area.eyebrow} / TOPIC`;
  $('#researchTopicTitle').textContent=item.title;
  $('#researchTopicSummary').textContent=item.summary;
  $('#researchSubtopicGrid').innerHTML=item.children.map((child,i)=>`<article class="research-subtopic"><span>${String(i+1).padStart(2,'0')}</span><h3>${child}</h3><p>${item.title} 분야의 ${child} 관련 정책·지표·자료를 연결합니다.</p><button type="button">자료 보기 <i class="bi bi-arrow-right"></i></button></article>`).join('');
  const list=(kind)=>item.children.slice(0,3).map((child,i)=>`<article class="research-list-item"><span>${kind}</span><strong>${item.title} ${child} ${i===0?'동향과 주요 과제':'자료'}</strong><i class="bi bi-arrow-up-right"></i></article>`).join('');
  $('#researchReports').innerHTML=list('REPORT');
  $('#researchResources').innerHTML=list('SOURCE');
  $('#researchHylab').innerHTML=list('HYLAB');
  $('#researchNotes').innerHTML=list('NOTE');
  requestAnimationFrame(()=>$('#researchTopicPanel').scrollIntoView({behavior:'smooth',block:'start'}));
}

function renderSection(key,topic=null){
  const s=state.data.sections[key];
  document.documentElement.style.setProperty('--hero1',s.colors[0]);
  document.documentElement.style.setProperty('--hero2',s.colors[1]);
  const isTechnology=key==='technology';
  const isResearch=['policy','industry','institution'].includes(key);
  const area=state.data.researchAreasV2?.[key];
  $('#sectionHero').innerHTML=`<span class="eyebrow light">${isTechnology?'TECHNOLOGY INTELLIGENCE':area?.eyebrow||s.title.toUpperCase()}</span><h2>${isTechnology?s.title:area?.title||s.title}</h2><p>${isTechnology?s.description:area?.subtitle||s.description}</p>`;
  $('#technologyWorkspace').hidden=!isTechnology;
  $('#researchWorkspace').hidden=!isResearch;
  $('#legacySectionSummary').style.display='none';
  $('#legacyIndicatorPanel').style.display='none';
  if(isTechnology)renderTechnologyV14(topic);
  if(isResearch)renderResearchArea(key,topic);
}
function renderIndicatorTable(filter=''){const q=($('#indicatorSearch')?.value||'').toLowerCase();const rows=state.data.indicators.filter(r=>(!filter||r[0]===state.data.sections[filter]?.title||filter==='explorer'||filter==='archive')&&r.join(' ').toLowerCase().includes(q));$('#indicatorTable').innerHTML=rows.map(r=>`<tr>${r.map(c=>`<td>${c||'-'}</td>`).join('')}</tr>`).join('')||'<tr><td colspan="5">검색 결과가 없습니다.</td></tr>'}
function setView(view,topic=null,shouldUpdateUrl=true){
  state.currentView=view;state.currentTopic=topic;
  $$('.view').forEach(v=>v.classList.remove('active'));
  $$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===view));
  const labels={dashboard:'DASHBOARD',technology:'TECHNOLOGY',policy:'POLICY',industry:'INDUSTRY',institution:'REGULATION',explorer:'DATA',archive:'ARCHIVE',assistant:'AI ASSISTANT'};
  $('#breadcrumbLabel').textContent=labels[view]||'DASHBOARD';
  if(view==='dashboard'){
    $('#dashboardView').classList.add('active');
    $('#pageTitle').textContent='바이오정책 인텔리전스';
    $('#pageSubtitle').textContent='오늘의 현안에서 기술·정책·산업·제도까지 한눈에 살펴봅니다.';
  }else if(view==='assistant'){
    $('#assistantView').classList.add('active');
    $('#pageTitle').textContent='AI 정책 Q&A';
    $('#pageSubtitle').textContent='등록된 정책정보를 연결해 빠르게 탐색합니다.';
  }else{
    $('#sectionView').classList.add('active');
    const key=['technology','policy','industry','institution'].includes(view)?view:'technology';
    renderSection(key,topic);
    if(view==='explorer'||view==='archive'){
      $('#technologyWorkspace').hidden=true;
            $('#legacySectionSummary').style.display='none';
      $('#legacyIndicatorPanel').style.display='block';
      renderIndicatorTable(view);
      $('#sectionHero').innerHTML=`<span class="eyebrow light">${view==='explorer'?'DATA EXPLORER':'POLICY ARCHIVE'}</span><h2>${view==='explorer'?'통계·데이터':'정책자료실'}</h2><p>${view==='explorer'?'기술·정책·산업·제도 지표를 통합 검색합니다.':'향후 보고서·법령·통계 원문을 축적할 공간입니다.'}</p>`;
    }
    const techTitle=topic&&state.data.technologyV14?.topics?.[topic]?.title;
    const researchTitle=topic&&state.data.researchAreasV2?.[key]?.topics?.[topic]?.title;
    $('#pageTitle').textContent=techTitle||researchTitle||(view==='explorer'?'통계·데이터':view==='archive'?'정책자료실':state.data.researchAreasV2?.[key]?.title||state.data.sections[key].title);
    $('#pageSubtitle').textContent=view==='technology'?'바이오 일반의 핵심지표와 AI 정책질문, 기술주제를 탐색합니다.':topic?'선택한 세부 영역의 자료와 연구질문을 탐색합니다.':'영역 카드를 통해 하위 주제와 자료로 이동합니다.';
  }
  if(shouldUpdateUrl)updateUrl(view,topic);
  closeSidebar();window.scrollTo({top:0,behavior:'smooth'});
}
function renderPromptChips(){const prompts=['합성생물학을 4개 영역으로 요약해줘','BT 투자 지표를 알려줘','바이오산업 인력 현황은?'];$('#promptChips').innerHTML=prompts.map(p=>`<button class="prompt-chip">${p}</button>`).join('')}
function answerQuestion(q){const t=Object.keys(state.data.topics).find(k=>q.includes(k));if(t){const o=state.data.topics[t];return `${t}은 다음과 같이 연결됩니다.\n\n기술: ${o.기술.join(', ')}\n정책: ${o.정책.join(', ')}\n산업: ${o.산업.join(', ')}\n제도: ${o.제도.join(', ')}`}if(q.includes('투자'))return '정부 BT 연구개발비는 예시 데이터 기준 2024년 5.2조원입니다.';if(q.includes('인력'))return '바이오산업 인력은 예시 데이터 기준 2024년 10.3만명입니다.';return '현재 데모는 등록된 주제와 지표를 중심으로 답변합니다.'}
function addMessage(text,type){const d=document.createElement('div');d.className=type==='user'?'user-message':'assistant-message';d.textContent=text;$('#chatLog').appendChild(d);$('#chatLog').scrollTop=$('#chatLog').scrollHeight}
function bindEvents(){$$('.nav-item').forEach(n=>n.addEventListener('click',()=>setView(n.dataset.view)));document.addEventListener('click',e=>{const a=e.target.closest('[data-topic-link]');if(!a)return;e.preventDefault();setView(a.dataset.view,a.dataset.topic)});document.addEventListener('click',e=>{const tab=e.target.closest('.technology-topic-tab');if(tab){renderTechnologyTopic(tab.dataset.topic);updateUrl('technology',tab.dataset.topic);$('#technologyTopicDetail').scrollIntoView({behavior:'smooth',block:'start'});return;}const trend=e.target.closest('.technology-trend-tab');if(trend){const topic=state.data.technologyV14.topics[state.currentTopic];$$('.technology-trend-tab').forEach(t=>t.classList.remove('active'));trend.classList.add('active');$('#technologyTrendContent').textContent=topic.trends[trend.dataset.trend];}});$('#researchOverviewButton').addEventListener('click',()=>setView(state.currentView));document.addEventListener('click',e=>{const b=e.target.closest('.research-breadcrumb button[data-view]');if(b)setView(b.dataset.view)});window.addEventListener('popstate',()=>{const p=new URLSearchParams(location.search);setView(p.get('view')||'technology',p.get('topic'),false)});$$('[data-jump]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.jump)));$('#themeButton').addEventListener('click',()=>{document.body.classList.toggle('dark');$('#themeButton i').className=document.body.classList.contains('dark')?'bi bi-sun':'bi bi-moon';setTimeout(renderCharts,80)});$('#menuButton').addEventListener('click',()=>{$('#sidebar').classList.add('open');$('#sidebarOverlay').classList.add('show')});$('#sidebarOverlay').addEventListener('click',closeSidebar);$('#indicatorSearch').addEventListener('input',()=>renderIndicatorTable(state.currentView));$('#promptChips').addEventListener('click',e=>{if(e.target.matches('.prompt-chip')){$('#chatInput').value=e.target.textContent;$('#chatForm').requestSubmit()}});$('#chatForm').addEventListener('submit',e=>{e.preventDefault();const q=$('#chatInput').value.trim();if(!q)return;addMessage(q,'user');$('#chatInput').value='';setTimeout(()=>addMessage(answerQuestion(q),'assistant'),300)});$$('.topic-primary.disabled').forEach(a=>a.addEventListener('click',e=>e.preventDefault()))}
function closeSidebar(){$('#sidebar').classList.remove('open');$('#sidebarOverlay').classList.remove('show')}
document.addEventListener('DOMContentLoaded',init);
