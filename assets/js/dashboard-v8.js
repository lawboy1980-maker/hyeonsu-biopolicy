(() => {
  'use strict';

  const NOTION_URL = 'https://app.notion.com/p/fa8d4fb285c74beb9448369af40c5fe1';
  const COLORS = ['#2f9b58', '#7357e9', '#ef7d32', '#2f6df6', '#d04f7c', '#159a9c'];
  const $ = (selector, root = document) => root.querySelector(selector);

  const trendDefinitions = [
    { key: 'policy', title: '정부 BT 연구개발 투자' },
    { key: 'industry', title: '바이오산업 시장규모' },
    { key: 'vc', title: '바이오·의료 VC 투자' },
    { key: 'technology', title: '바이오 SCIE 논문' },
    { key: 'patent', title: '바이오 등록특허' },
    { key: 'workforce', title: '바이오산업 종사자' }
  ];

  function insertAfter(reference, node) {
    reference.parentNode.insertBefore(node, reference.nextSibling);
  }

  function formatNumber(value) {
    return Number(value).toLocaleString('ko-KR', { maximumFractionDigits: 1 });
  }

  function rgba(hex, alpha) {
    const n = Number.parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  }

  function changeRate(values) {
    if (!Array.isArray(values) || values.length < 2) return null;
    const latest = Number(values.at(-1));
    const previous = Number(values.at(-2));
    if (!Number.isFinite(latest) || !Number.isFinite(previous) || previous === 0) return null;
    return ((latest - previous) / previous) * 100;
  }

  function createTrendDashboard() {
    const performance = $('.performance-section');
    const data = window.DASHBOARD_DATA?.charts;
    if (!performance || !data || $('#trendDashboard')) return;

    const section = document.createElement('section');
    section.id = 'trendDashboard';
    section.className = 'trend-dashboard-section';
    section.innerHTML = `
      <div class="section-title-row">
        <div><span class="eyebrow">CORE INDICATOR TRENDS</span><h2>핵심지표 트렌드</h2></div>
        <span class="data-note">최근 시계열 기준 · 3개씩 2행</span>
      </div>
      <div class="trend-grid" id="trendGrid"></div>`;
    insertAfter(performance, section);

    const grid = $('#trendGrid');
    trendDefinitions.forEach((definition, index) => {
      const series = data[definition.key];
      if (!series) return;
      const rate = changeRate(series.data);
      const direction = rate === null ? '' : rate > 0 ? 'up' : rate < 0 ? 'down' : 'flat';
      const rateText = rate === null ? '' : `${rate > 0 ? '▲' : rate < 0 ? '▼' : '―'} ${Math.abs(rate).toFixed(1)}%`;
      const card = document.createElement('article');
      card.className = 'panel trend-card';
      card.innerHTML = `
        <div class="trend-card-head">
          <div><span class="eyebrow">TREND ${String(index + 1).padStart(2, '0')}</span><h3>${definition.title}</h3></div>
          <div class="trend-summary">
            <strong>${formatNumber(series.data.at(-1))}<small>${series.unit}</small></strong>
            <span class="trend-rate ${direction}">${rateText}</span>
          </div>
        </div>
        <div class="trend-chart-wrap"><canvas id="trendChart${index}"></canvas></div>
        <div class="trend-card-foot"><span>${series.labels[0]}–${series.labels.at(-1)}</span><span>${series.note || ''}</span></div>`;
      grid.appendChild(card);

      new Chart($(`#trendChart${index}`), {
        type: 'line',
        data: {
          labels: series.labels,
          datasets: [{
            data: series.data,
            borderColor: COLORS[index],
            backgroundColor: rgba(COLORS[index], 0.10),
            fill: true,
            tension: 0.35,
            pointRadius: 2.5,
            pointHoverRadius: 5,
            borderWidth: 2.2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { intersect: false, mode: 'index' },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: context => `${formatNumber(context.parsed.y)} ${series.unit}`
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#7e8da2', maxRotation: 0, autoSkip: true, maxTicksLimit: 6 } },
            y: { beginAtZero: false, grid: { color: 'rgba(120,140,170,.13)' }, ticks: { color: '#7e8da2', maxTicksLimit: 5 } }
          }
        }
      });
    });
  }

  function createStrategicIntelligence() {
    const schedulePanel = $('.lead-grid > .panel:nth-child(2)');
    if (!schedulePanel) return;
    schedulePanel.innerHTML = `
      <div class="panel-heading">
        <div><span class="eyebrow">STRATEGIC INTELLIGENCE</span><h2>Strategic Intelligence</h2></div>
        <span class="data-note">정책적 해석</span>
      </div>
      <div class="strategic-grid">
        <article class="strategic-item strength"><span>S · STRENGTH</span><strong>바이오 R&D와 공공 연구인프라의 축적</strong></article>
        <article class="strategic-item weakness"><span>W · WEAKNESS</span><strong>전문인력 및 연구성과 사업화 연계 부족</strong></article>
        <article class="strategic-item opportunity"><span>O · OPPORTUNITY</span><strong>AI-Bio·바이오제조 중심의 정책 확대</strong></article>
        <article class="strategic-item threat"><span>T · THREAT</span><strong>글로벌 바이오안보와 공급망 규제 강화</strong></article>
        <article class="strategic-insight"><span>STRATEGIC INSIGHT</span><strong>AI·자동화 인프라 투자와 전문인력 정책을 하나의 전략으로 연결할 필요가 있습니다.</strong></article>
      </div>`;
  }

  function createWorkspace() {
    const news = $('.hslab-news-panel');
    if (!news || $('#myWorkspace')) return;
    const section = document.createElement('section');
    section.id = 'myWorkspace';
    section.className = 'panel workspace-panel';
    section.innerHTML = `
      <div class="panel-heading workspace-heading">
        <div><span class="eyebrow">MY WORKSPACE</span><h2>My Workspace</h2><p>Notion에서 연구 메모, 정책과제, 논문과 보고서를 관리합니다.</p></div>
        <a class="primary-button workspace-open" href="${NOTION_URL}" target="_blank" rel="noopener noreferrer"><i class="bi bi-box-arrow-up-right"></i> Notion 열기</a>
      </div>
      <div class="workspace-grid">
        <a href="${NOTION_URL}" target="_blank" rel="noopener noreferrer" class="workspace-card"><i class="bi bi-journal-text"></i><div><strong>정책 메모</strong><small>검토 의견과 아이디어 정리</small></div></a>
        <a href="${NOTION_URL}" target="_blank" rel="noopener noreferrer" class="workspace-card"><i class="bi bi-check2-square"></i><div><strong>오늘의 할 일</strong><small>이번 주 연구과제 관리</small></div></a>
        <a href="${NOTION_URL}" target="_blank" rel="noopener noreferrer" class="workspace-card"><i class="bi bi-file-earmark-text"></i><div><strong>보고서·논문</strong><small>작성 중 문서 바로가기</small></div></a>
        <a href="${NOTION_URL}" target="_blank" rel="noopener noreferrer" class="workspace-card"><i class="bi bi-diagram-3"></i><div><strong>SWOT·전략</strong><small>전략 인텔리전스 관리</small></div></a>
      </div>
      <p class="workspace-note"><i class="bi bi-shield-lock"></i> 현재는 안전한 외부 링크 방식입니다. Notion API 자동연동은 토큰 보호를 위해 GitHub Actions 또는 서버리스 중계가 필요합니다.</p>`;
    insertAfter(news, section);
  }

  function removeDuplicatedSections() {
    $('.topic-panel')?.remove();
    $('.analytics-section')?.remove();
  }

  function reorderDashboard() {
    const dashboard = $('#dashboardView');
    const hero = $('.hero-panel');
    const performance = $('.performance-section');
    const trends = $('#trendDashboard');
    const lead = $('.lead-grid');
    const news = $('.hslab-news-panel');
    const workspace = $('#myWorkspace');
    if (!dashboard) return;
    [hero, performance, trends, lead, news, workspace].filter(Boolean).forEach(element => dashboard.appendChild(element));
  }

  function boot() {
    if (!window.Chart || !window.DASHBOARD_DATA) return;
    createTrendDashboard();
    createStrategicIntelligence();
    createWorkspace();
    removeDuplicatedSections();
    reorderDashboard();
  }

  window.addEventListener('DOMContentLoaded', boot);
})();
