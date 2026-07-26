const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];

const DATA = {
  homeKpis: [
    {label:"국가 바이오 R&D 투자", value:"5.8조원", change:"전년 대비 6.2%"},
    {label:"바이오산업 생산규모", value:"23.4조원", change:"전년 대비 7.5%"},
    {label:"바이오기업", value:"1,186개", change:"신규 42개사"},
    {label:"바이오 논문", value:"31,482편", change:"전년 대비 4.8%"},
    {label:"바이오 특허", value:"12,740건", change:"전년 대비 3.1%"}
  ],
  news: [
    {category:"보도자료", source:"과학기술정보통신부", title:"AI 바이오 혁신생태계 조성을 위한 정책 방향", summary:"AI와 바이오 융합 연구개발 및 인프라 지원 방향을 정리한 예시 콘텐츠입니다.", date:"2026.07.26"},
    {category:"정책", source:"정책브리핑", title:"합성생물학 육성정책 추진체계와 향후 과제", summary:"기본계획, 기술수준평가 및 정책전문기관의 역할을 중심으로 구성한 예시입니다.", date:"2026.07.24"},
    {category:"산업", source:"Bio Industry", title:"혁신신약 분야 투자 및 기술수출 동향", summary:"국내외 혁신신약 기업의 투자·공동개발·기술사업화 흐름을 정리한 예시입니다.", date:"2026.07.22"},
    {category:"해외", source:"OECD", title:"바이오경제와 신흥기술 거버넌스 국제동향", summary:"주요국 바이오 정책과 거버넌스 변화 방향을 비교한 예시입니다.", date:"2026.07.19"}
  ],
  bioKpis: [
    {label:"기술수준", value:"82.1%", change:"최고기술국 대비"},
    {label:"정부 R&D", value:"5.8조원", change:"바이오 분야"},
    {label:"논문", value:"31,482편", change:"최근 연도"},
    {label:"특허", value:"12,740건", change:"최근 연도"},
    {label:"산업 생산", value:"23.4조원", change:"바이오산업"}
  ],
  aiQuestions: [
    "국가 바이오기술 수준을 높이기 위해 우선 투자할 분야는 무엇인가?",
    "바이오 R&D 성과가 산업화로 연결되지 못하는 병목은 무엇인가?",
    "주요국 정책 변화가 국내 바이오 전략에 미치는 영향은 무엇인가?"
  ],
  topics: {
    "synthetic-biology": {
      index:"01", title:"합성생물학",
      definition:"생명시스템을 설계·제작·재구성하여 새로운 기능과 산업적 가치를 구현하는 공학적 바이오기술입니다.",
      oneLine:"바이오를 분석하는 기술에서 설계하고 제조하는 기술로 전환시키는 기반기술",
      kpis:[["정책단계","법·기본계획"],["핵심인프라","바이오파운드리"],["정책범위","R&D·산업·안전"]],
      agendas:[
        ["진행 중","합성생물학 기본계획","법정 기본계획 수립을 위한 비전·목표·추진과제 설계"],
        ["준비","현황조사·통계체계","분류체계와 조사방법론을 기반으로 정책통계를 구축"],
        ["상시","규제 발굴·지원","연구·산업 현장의 규제이슈를 발굴하고 개선과제를 제안"]
      ],
      tech:["DBTL 자동화","유전자회로 설계","무세포 시스템","바이오파운드리"],
      trends:{
        "기술":"자동화·AI·고속실험을 결합한 설계-제작-시험-학습 체계가 확산되고 있습니다.",
        "정책":"주요국은 바이오제조 역량과 공급망·안보를 국가전략 차원에서 다루고 있습니다.",
        "산업":"의약품, 소재, 식품, 화학제품 등 다양한 제조분야로 적용이 확대되고 있습니다.",
        "제도":"안전·보안·데이터·표준·책임성에 관한 선제적 제도 논의가 중요해지고 있습니다."
      },
      resources:[["정책","합성생물학 육성법"],["계획","합성생물학 기본계획 자료"],["분석","글로벌 정책동향 브리프"]]
    },
    "ai-bio": {
      index:"02", title:"AI 바이오",
      definition:"인공지능을 활용해 생명현상을 해석하고 신약·단백질·세포·바이오공정을 설계하는 융합기술입니다.",
      oneLine:"데이터와 계산을 통해 바이오 연구의 탐색·설계·검증 속도를 높이는 기술",
      kpis:[["정책단계","생태계 구축"],["핵심자원","데이터·컴퓨팅"],["정책범위","연구·인프라·인재"]],
      agendas:[
        ["진행 중","AI 바이오 혁신거점","데이터·컴퓨팅·실험 인프라를 연계한 연구거점 설계"],
        ["준비","AI 바이오 핵심기술 로드맵","기술분류, 미션, 투자우선순위 및 성과지표 정립"],
        ["검토","책임성과 신뢰기반","데이터 품질, 검증, 책임관계 및 윤리원칙 검토"]
      ],
      tech:["멀티오믹스 AI","생성형 단백질 설계","AI 신약개발","자율실험실"],
      trends:{
        "기술":"파운데이션 모델과 생성형 AI가 단백질·분자·세포 설계로 확장되고 있습니다.",
        "정책":"데이터 접근성, 컴퓨팅 자원, 실험검증 인프라를 묶는 정책이 중요해지고 있습니다.",
        "산업":"플랫폼 기업과 제약·바이오기업 간 공동개발 및 기술이전이 확대되고 있습니다.",
        "제도":"AI 결과의 검증가능성, 설명가능성, 의료·연구 책임관계가 주요 쟁점입니다."
      },
      resources:[["전략","AI 바이오 국가전략"],["동향","글로벌 AI 바이오 투자동향"],["분석","AI 신약개발 정책이슈"]]
    },
    "drug-development": {
      index:"03", title:"신약개발",
      definition:"질병기전을 규명하고 유효물질 발굴부터 비임상·임상·허가까지 치료제를 개발하는 전주기 기술영역입니다.",
      oneLine:"과학적 발견을 안전하고 유효한 치료제로 전환하는 고위험·장기 연구개발 과정",
      kpis:[["정책단계","전주기 지원"],["핵심성과","후보물질·임상"],["정책범위","R&D·규제·사업화"]],
      agendas:[
        ["진행 중","AI 신약개발 문샷","난제 중심의 국가 임무와 연구개발 포트폴리오 설계"],
        ["준비","차세대 모달리티 전략","신규 표적과 치료방식에 대한 원천기술 및 사업화 지원"],
        ["상시","규제과학 연계","첨단 치료제의 평가기술과 인허가 예측가능성 강화"]
      ],
      tech:["표적발굴","신규 모달리티","전임상 모델","정밀의료"],
      trends:{
        "기술":"AI, 오믹스, 공간생물학, 환자유래 모델이 전주기 의사결정에 활용되고 있습니다.",
        "정책":"대형 임무형 사업과 공공데이터·인프라 연계가 확대되고 있습니다.",
        "산업":"기술수출과 공동개발이 주요 사업화 경로로 자리 잡고 있습니다.",
        "제도":"혁신기술에 대한 규제과학, 실사용데이터 및 조건부 허가 논의가 확대되고 있습니다."
      },
      resources:[["로드맵","AI 신약개발 난제지도"],["산업","기술수출 동향"],["제도","첨단치료제 규제동향"]]
    },
    "green-white-bio": {
      index:"04", title:"그린·화이트바이오",
      definition:"농업·식품·소재·환경·에너지·제조 분야에서 생물자원과 생물공정을 활용하는 산업바이오 영역입니다.",
      oneLine:"바이오기술로 생산과 소비의 지속가능성을 높이는 산업전환 기술",
      kpis:[["정책단계","산업전환"],["핵심자원","바이오매스·균주"],["정책범위","농식품·소재·제조"]],
      agendas:[
        ["준비","바이오제조 전략","바이오 기반 소재·화학·식품 제조역량과 실증기반 강화"],
        ["검토","Bio for AI","AI 인프라의 에너지·저장·자원 문제를 바이오기술로 해결하는 장기 아젠다"],
        ["상시","시장창출·표준","공공조달, 인증, 표준 및 탄소가치 연계방안 검토"]
      ],
      tech:["정밀발효","바이오리파이너리","세포공장","바이오리칭"],
      trends:{
        "기술":"정밀발효, 대사공학, 효소공학과 공정자동화가 결합되고 있습니다.",
        "정책":"기후·공급망·제조혁신 정책과 바이오경제 전략의 연계가 강화되고 있습니다.",
        "산업":"식품, 화학, 소재, 에너지 분야에서 바이오 기반 대체제품 시장이 확대되고 있습니다.",
        "제도":"제품 분류, 안전성, 표시, 인증, 탄소감축 가치 인정이 주요 과제입니다."
      },
      resources:[["전략","바이오경제 전환전략"],["산업","정밀발효 시장동향"],["기획","Bio for AI 컨셉페이퍼"]]
    }
  }
};

const state = {view:"home", topic:"synthetic-biology", chart:null};

function setHeader(view){
  const meta = {
    home:["HOME","대시보드","바이오 정책 연구를 시작하는 통합 진입 화면입니다."],
    quick:["QUICK RESEARCH","통합검색","기술·정책·산업·기관 자료를 한 번에 탐색합니다."],
    technology:["TECHNOLOGY","기술","바이오 기술의 현재와 정책적 대응을 한 화면에서 탐색합니다."],
    ai:["AI POLICY QUESTIONS","AI 정책질문","정책질문과 출처 기반 분석을 위한 공간입니다."],
    policy:["POLICY","정책","정책 영역은 다음 버전에서 설계합니다."],
    industry:["INDUSTRY","산업","산업 영역은 다음 버전에서 설계합니다."],
    institution:["INSTITUTION","기관","기관·제도 영역은 다음 버전에서 설계합니다."]
  }[view];
  $("#breadcrumbLabel").textContent=meta[0]; $("#pageTitle").textContent=meta[1]; $("#pageSubtitle").textContent=meta[2];
}

function setView(view){
  state.view=view;
  $$(".view").forEach(v=>v.classList.remove("active"));
  const target = ["policy","industry","institution"].includes(view) ? $("#placeholderView") : $(`#${view}View`);
  target.classList.add("active");
  $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  if(["policy","industry","institution"].includes(view)){
    const labels={policy:["정책","국가전략, 기본계획, 사업 및 정책수단 영역은 다음 버전에서 별도로 설계합니다."],industry:["산업","시장, 기업, 투자, 기술수출 및 산업생태계 영역은 다음 버전에서 설계합니다."],institution:["기관","법령, 규제, 가이드라인, 정책기관 및 거버넌스 영역은 다음 버전에서 설계합니다."]};
    $("#placeholderTitle").textContent=labels[view][0]; $("#placeholderDescription").textContent=labels[view][1];
  }
  setHeader(view); closeSidebar(); window.scrollTo({top:0,behavior:"smooth"});
  history.replaceState({}, "", view==="home" ? location.pathname : `#${view}${view==="technology"?"/"+state.topic:""}`);
}

function renderKpis(){
  const html=DATA.homeKpis.map(x=>`<article class="kpi-card"><span>${x.label}</span><strong>${x.value}</strong><small>▲ ${x.change}</small></article>`).join("");
  $("#homeKpiGrid").innerHTML=html;
  $("#bioKpiGrid").innerHTML=DATA.bioKpis.map(x=>`<article class="kpi-card"><span>${x.label}</span><strong>${x.value}</strong><small>${x.change}</small></article>`).join("");
}

function renderNews(filter="전체"){
  const categories=["전체",...new Set(DATA.news.map(x=>x.category))];
  $("#newsFilters").innerHTML=categories.map(c=>`<button class="news-filter ${c===filter?"active":""}" data-news-filter="${c}">${c}</button>`).join("");
  const rows=filter==="전체"?DATA.news:DATA.news.filter(x=>x.category===filter);
  $("#newsList").innerHTML=rows.map(x=>`<article class="news-item"><div class="news-source">${x.source}</div><div><h3>${x.title}</h3><p>${x.summary}</p></div><div class="news-date">${x.date}</div></article>`).join("");
}

function renderTechnology(){
  const keys=Object.keys(DATA.topics);
  $("#topicTabs").innerHTML=keys.map(k=>`<button class="topic-tab ${k===state.topic?"active":""}" data-topic="${k}">${DATA.topics[k].title}</button>`).join("");
  $("#aiQuestionGrid").innerHTML=DATA.aiQuestions.map((q,i)=>`<article class="question-card"><span>POLICY QUESTION 0${i+1}</span><p>${q}</p></article>`).join("");
  renderTopic(state.topic);
  if(window.Chart){
    if(state.chart) state.chart.destroy();
    state.chart=new Chart($("#overviewChart"),{type:"line",data:{labels:["2020","2021","2022","2023","2024"],datasets:[{data:[76.2,77.5,79.1,80.4,82.1],borderColor:"#11a59b",backgroundColor:"rgba(17,165,155,.12)",fill:true,tension:.35,pointRadius:3}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{display:false},x:{grid:{display:false}}}}});
  }
}

function renderTopic(slug){
  state.topic=slug; const t=DATA.topics[slug];
  $$(".topic-tab").forEach(b=>b.classList.toggle("active",b.dataset.topic===slug));
  $("#topicTitle").textContent=t.title; $("#topicDefinition").textContent=t.definition; $("#topicIndex").textContent=t.index; $("#oneLineDefinition").textContent=t.oneLine;
  $("#topicKpiGrid").innerHTML=t.kpis.map(x=>`<div class="topic-kpi"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join("");
  $("#agendaSummary").textContent=`총 ${t.agendas.length}개 정책업무`;
  $("#agendaGrid").innerHTML=t.agendas.map(x=>`<article class="agenda-card"><span>${x[0]}</span><h3>${x[1]}</h3><p>${x[2]}</p></article>`).join("");
  $("#coreTechGrid").innerHTML=t.tech.map(x=>`<div class="core-tech">${x}</div>`).join("");
  const trendKeys=Object.keys(t.trends);
  $("#trendTabs").innerHTML=trendKeys.map((x,i)=>`<button class="trend-tab ${i===0?"active":""}" data-trend="${x}">${x}</button>`).join("");
  $("#trendContent").textContent=t.trends[trendKeys[0]];
  $("#resourceGrid").innerHTML=t.resources.map(x=>`<article class="resource-card"><span>${x[0]}</span><h3>${x[1]}</h3><p>관련 정책자료 예시</p></article>`).join("");
  history.replaceState({}, "", `#technology/${slug}`);
}

function demoSearch(q, target){
  const value=q.trim();
  target.innerHTML=value?`<strong>“${value}”</strong> 관련 자료를 찾았습니다. 실제 데이터 연동 후 검색결과와 출처가 표시됩니다.`:"검색어를 입력해 주세요.";
  target.classList.add("show");
}

function renderQuickResults(q){
  const value=q.trim();
  if(!value){$("#quickSearchResults").innerHTML="";return}
  const candidates=[
    ["Technology",`${value} 관련 기술주제와 핵심기술을 탐색합니다.`],
    ["Policy Agenda",`${value} 관련 추진 중·준비 중 정책업무를 탐색합니다.`],
    ["Latest Updates",`${value} 관련 기사·보도자료를 탐색합니다.`]
  ];
  $("#quickSearchResults").innerHTML=candidates.map(x=>`<article class="search-result-card"><strong>${x[0]}</strong><p>${x[1]}</p></article>`).join("");
}

function demoAi(q,target){
  const value=q.trim();
  target.innerHTML=value?`<strong>시연 답변</strong><br>“${value}”에 대한 정책분석 영역입니다. 실제 구현에서는 내부 연구자료와 외부 자료를 검색하고 출처를 함께 제시합니다.`:"정책질문을 입력해 주세요.";
  target.classList.add("show");
}

function closeSidebar(){ $("#sidebar").classList.remove("open"); $("#sidebarOverlay").classList.remove("show"); }

document.addEventListener("click",e=>{
  const viewButton=e.target.closest("[data-view]");
  if(viewButton){setView(viewButton.dataset.view);return}
  const topic=e.target.closest("[data-topic]");
  if(topic){renderTopic(topic.dataset.topic);return}
  const shortcut=e.target.closest("[data-topic-shortcut]");
  if(shortcut){state.topic=shortcut.dataset.topicShortcut;setView("technology");renderTechnology();return}
  const filter=e.target.closest("[data-news-filter]");
  if(filter){renderNews(filter.dataset.newsFilter);return}
  const trend=e.target.closest("[data-trend]");
  if(trend){
    $$(".trend-tab").forEach(b=>b.classList.remove("active"));trend.classList.add("active");
    $("#trendContent").textContent=DATA.topics[state.topic].trends[trend.dataset.trend];return;
  }
  const tag=e.target.closest("[data-search-query]");
  if(tag){$("#homeSearchInput").value=tag.dataset.searchQuery;demoSearch(tag.dataset.searchQuery,$("#homeSearchResult"))}
});

$("#homeSearchButton").addEventListener("click",()=>demoSearch($("#homeSearchInput").value,$("#homeSearchResult")));
$("#homeSearchInput").addEventListener("keydown",e=>{if(e.key==="Enter")demoSearch(e.target.value,$("#homeSearchResult"))});
$("#homeAiButton").addEventListener("click",()=>demoAi($("#homeAiInput").value,$("#homeAiResult")));
$("#quickSearchButton").addEventListener("click",()=>renderQuickResults($("#quickSearchInput").value));
$("#quickSearchInput").addEventListener("keydown",e=>{if(e.key==="Enter")renderQuickResults(e.target.value)});
$("#aiWorkspaceButton").addEventListener("click",()=>demoAi($("#aiWorkspaceInput").value,$("#aiWorkspaceResult")));

$("#themeButton").addEventListener("click",()=>document.body.classList.toggle("dark"));
$("#menuButton").addEventListener("click",()=>{$("#sidebar").classList.add("open");$("#sidebarOverlay").classList.add("show")});
$("#sidebarOverlay").addEventListener("click",closeSidebar);

renderKpis(); renderNews(); renderTechnology();
const hash=location.hash.replace("#","");
if(hash.startsWith("technology/")){state.topic=hash.split("/")[1]||state.topic;setView("technology");renderTechnology()}
else if(["quick","technology","ai","policy","industry","institution"].includes(hash)){setView(hash)}
else setView("home");
